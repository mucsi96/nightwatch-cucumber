'use strict'

const path = require('path')
const pify = require('pify')
const co = require('co')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const mkdirp = pify(require('mkdirp'))
const btoa = require('btoa')
const peerRequire = require('./peer-require')
const cucumberJunitReport = require('./cucumber-junit-report')
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
  }

  addWorldProvider (worldProvider) {
    this.worldProvider = worldProvider
  }

  isCucumberListener (fn) {
    return fn.name === 'handleStepResult' ||
      fn.name === 'handleFeaturesResult' ||
      (/handle(Before|After)(Scenario|Feature|Features)/).test(fn.name)
  }

  isStepDefinitionAsynchronous (stepDefinition, parameters) {
    if (this.options.nightwatchClientAsParameter) {
      return stepDefinition.length === parameters.length + 2
    }

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

  wrapStepDefinition (stepDefinitionRunner, code, parameters) {
    const self = this
    const originalCode = code
    if (!this.isCucumberListener(code) && !this.isStepDefinitionAsynchronous(code, parameters)) {
      return co.wrap(function * () {
        return yield * stepDefinitionRunner.call(this, originalCode, parameters)
      })
    } else if (this.isCucumberListener(code) && parameters.length && 'attachments' in parameters[0]) {
      const stepResult = parameters[0]

      if (
          this.attachmentProvider &&
          stepResult.status === Cucumber.statuses.FAILED &&
          !stepResult._handledByNightwatchCucumber
        ) {
        stepResult._handledByNightwatchCucumber = true
        return co.wrap(function * () {
          yield * self.handleAttachments(stepResult)
          originalCode.apply(this, arguments)
        })
      }
    }

    return originalCode
  }

  addStepDefinitionRunner (stepDefinitionRunner) {
    const self = this
    const originalUserCodeRunnerRun = Cucumber.userCodeRunner.run
    Cucumber.userCodeRunner.run = co.wrap(function * (args) {
      args.fn = self.wrapStepDefinition(stepDefinitionRunner, args.fn, args.argsArray)
      return yield originalUserCodeRunnerRun.call(this, args)
    })
  }

  * run (jsonReport) {
    yield mkdirp(path.dirname(jsonReport))
    const formats = ['pretty', `json:${jsonReport}`]
    let argv = process.argv.slice(0, 2)
    this.options.stepDefinitions.concat(this.options.supportFiles).forEach((file) => {
      argv.push('--require')
      argv.push(file)
    })
    this.options.tags.forEach((tag) => {
      argv.push('--tags')
      argv.push(tag)
    })

    formats.forEach((format) => {
      argv.push('--format')
      argv.push(format)
    })

    this.options.featureFiles.forEach((file) => {
      argv.push(file)
    })

    if (this.options.cucumberArgs) {
      argv = argv.concat(this.options.cucumberArgs.split(' '))
    }

    const cli = new Cucumber.Cli({
      argv,
      cwd: process.cwd(),
      stdout: process.stdout
    })

    return yield cli.run()
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

  * createCucumberJunitReport () {
    const report = JSON.parse(yield fs.readFile(this.options.jsonReport))

    if (this.options.junitReport) {
      cucumberJunitReport(this.options.junitReport, report)
    }
  }

}
