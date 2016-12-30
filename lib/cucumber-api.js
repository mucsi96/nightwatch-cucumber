'use strict'

const path = require('path')
const pify = require('pify')
const co = require('co')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const mkdirp = pify(require('mkdirp'))
const btoa = require('btoa')
const peerRequire = require('./peer-require')
const Cucumber = {
  Cli: peerRequire('cucumber/lib/cli').default,
  userCodeRunner: peerRequire('cucumber/lib/user_code_runner').default,
  Attachment: peerRequire('cucumber/lib/runtime/attachment_manager/attachment').default,
  statuses: peerRequire('cucumber/lib/status').default
}

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {

  constructor (options) {
    this.options = options
  }

  addAttachmentProvider (attachmentProvider) {
    this.attachmentProvider = attachmentProvider
    this.addStepDefinitionRunner()
  }

  isCucumberListener (fn) {
    return (/handle(Step|Features)Result/).test(fn.name) ||
      (/handle(Before|After)(Scenario|Feature|Features)/).test(fn.name)
  }

  isStepDefinitionAsynchronous (stepDefinition, parameters) {
    return stepDefinition.length === parameters.length + 1
  }

  * handleAttachments (stepResult) {
    try {
      const feature = stepResult.step.scenario.feature.name
      const scenario = stepResult.step.scenario.name
      const attachment = yield * this.attachmentProvider(feature, scenario)

      if (attachment) {
        stepResult.attachments.push(new Cucumber.Attachment({
          data: btoa(String.fromCharCode.apply(null, attachment.data)),
          mimeType: attachment.mimeType
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  wrapStepDefinition (code, parameters) {
    const self = this
    if (this.isCucumberListener(code) && parameters.length && 'attachments' in parameters[0]) {
      const stepResult = parameters[0]

      if (
          this.attachmentProvider &&
          stepResult.status === Cucumber.statuses.FAILED &&
          !stepResult._handledByNightwatchCucumber
        ) {
        stepResult._handledByNightwatchCucumber = true
        return co.wrap(function * () {
          yield * self.handleAttachments(stepResult)
          code.apply(this, arguments)
        })
      }
    }

    return code
  }

  addStepDefinitionRunner () {
    const self = this
    const originalUserCodeRunnerRun = Cucumber.userCodeRunner.run
    Cucumber.userCodeRunner.run = co.wrap(function * (args) {
      args.fn = self.wrapStepDefinition(args.fn, args.argsArray)
      return yield originalUserCodeRunnerRun.call(this, args)
    })
  }

  * run (jsonReport) {
    yield mkdirp(path.dirname(jsonReport))
    let argv = process.argv.slice(0, 2)
    this.options.tags.forEach((tag) => {
      argv.push('--tags')
      argv.push(tag)
    })

    if (this.options.cucumberArgs) {
      argv = argv.concat(this.options.cucumberArgs)
    }

    const cli = new Cucumber.Cli({
      argv,
      cwd: process.cwd(),
      stdout: process.stdout
    })

    return yield cli.run()
  }

  getJSONReportName () {
    const args = this.options.cucumberArgs

    const pattern = /^json:(.*)$/
    let i = 0
    while (i < args.length - 2 && !(args[i] === '--format' && pattern.test(args[i + 1]))) {
      i++
    }
    if (i < args.length - 2) {
      return args[i + 1].match(pattern)[1]
    }
  }

  getFeatureFiles () {
    const args = this.options.cucumberArgs
    const featureFiles = []
    let i = 0
    while (i < args.length) {
      if (args[i].startsWith('--')) {
        i += 2
      } else {
        featureFiles.push(args[i])
        i++
      }
    }
    return featureFiles
  }

  * mergeCucumberJsonReports (reports, target) {
    let sumReport = []
    for (let i = 0; i < reports.length; i++) {
      const report = JSON.parse(yield fs.readFile(reports[i]))
      sumReport = sumReport.concat(report)
      yield fs.unlink(reports[i])
    }
    yield fs.writeFile(target, JSON.stringify(sumReport, null, 2))
  }
}
