'use strict'

const path = require('path')
const pify = require('pify')
const co = require('co')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const mkdirp = pify(require('mkdirp'))
const open = require('open')
const peerRequire = require('./peer-require')
const isGeneratorFn = require('is-generator').fn
const cucumberHtmlReport = require('./cucumber-html-report')
const cucumberJunitReport = require('./cucumber-junit-report')
const Cucumber = {
  Cli: peerRequire('cucumber/lib/cli').default,
  userCodeRunner: peerRequire('cucumber/lib/user_code_runner').default,
  Attachment: peerRequire('cucumber/lib/runtime/attachment_manager/attachment').default
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
      fn.name.match(/handle(Before|After)(Scenario|Feature|Features)/)
  }

  isStepDefinitionAsynchronous (stepDefinition, parameters) {
    if (isGeneratorFn(stepDefinition)) return true
    if (this.options.nightwatchClientAsParameter) {
      return stepDefinition.length === parameters.length + 2
    }

    return stepDefinition.length === parameters.length + 1
  }

  * handleAttachments (stepResult) {
    try {
      const feature = stepResult.getStep().getScenario().getFeature().getName()
      const scenario = stepResult.getStep().getScenario().getName()
      const attachment = yield * this.attachmentProvider(feature, scenario)

      if (attachment) stepResult.getAttachments().push(new Cucumber.Attachment(attachment))
    } catch (err) {
      console.error(err)
    }
  }

  wrapStepDefinition (stepDefinitionRunner, code, parameters) {
    const originalCode = code
    if (!this.isCucumberListener(code) && !this.isStepDefinitionAsynchronous(code, parameters)) {
      return function * () {
        return yield * stepDefinitionRunner.call(this, originalCode, parameters)
      }
    } else if (this.isCucumberListener(code) && parameters.length && 'getAttachments' in parameters[0]) {
      const stepResult = parameters[0]

      if (
          this.attachmentProvider &&
          stepResult.getStatus() === Cucumber.Status.FAILED &&
          !stepResult._handledByNightwatchCucumber
        ) {
        stepResult._handledByNightwatchCucumber = true
        return function * () {
          yield * this.handleAttachments(stepResult)
          originalCode.apply(this, arguments)
        }
      }
    }

    return originalCode
  }

  addStepDefinitionRunner (stepDefinitionRunner) {
    const self = this
    const originalUserCodeRunnerRun = Cucumber.userCodeRunner.run
    Cucumber.userCodeRunner.run = co.wrap(function * (args) {
      args.fn = self.wrapStepDefinition(stepDefinitionRunner, args.fn, args.argsArray)
      return originalUserCodeRunnerRun.call(this, args)
    })
  }

  * run (jsonReport) {
    yield mkdirp(path.dirname(jsonReport))
    const formats = ['pretty', `json:${jsonReport}`]
    const argv = process.argv.slice(0, 2)
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

  * createCucumberHtmlReport () {
    const report = JSON.parse(yield fs.readFile(this.options.jsonReport))

    if (this.options.htmlReport) {
      cucumberHtmlReport(this.options.htmlReport, report)
      if (this.options.openReport) {
        open(this.options.htmlReport)
      }
    }
  }

  * createCucumberJunitReport () {
    const report = JSON.parse(yield fs.readFile(this.options.jsonReport))

    if (this.options.junitReport) {
      cucumberJunitReport(this.options.junitReport, report)
    }
  }

}
