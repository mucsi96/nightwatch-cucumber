'use strict'

const path = require('path')
const pify = require('pify')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const mkdirp = pify(require('mkdirp'))
const open = require('open')
const cucumberHtmlReport = require('./cucumber-html-report')
const Cucumber = require.main.require('cucumber/lib/cucumber')

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {

  constructor (options) {
    this.options = options
  }

  addStepFailureHook (hook) {
    this.stepFailureHook = hook
  }

  * _attach (stepResult, data, mimeType) {
    const attachments = stepResult.getAttachments()
    const attachment = Cucumber.Runtime.Attachment({ mimeType, data })
    attachments.push(attachment)
  }

  * _handleStepFailure (stepResult) {
    if (!this.stepFailureHook) return
    const step = stepResult.getStep()
    const scenario = step.getScenario()
    const feature = scenario.getFeature()

    yield * this.stepFailureHook({
      feature: feature.getName(),
      scenario: scenario.getName(),
      step: step.getName(),
      attach: this._attach.bind(this, stepResult)
    })
  }

  addStepDefinitionRunner (stepDefinitionRunner) {
    const self = this
    const originalUtilRun = Cucumber.Util.run
    Cucumber.Util.run = function (code, world, parameters, timeoutInMilliseconds, finish) {
      const originalCode = code
      // Run original if not a step definition was executed
      if (world) {
        code = function * () {
          yield * stepDefinitionRunner.call(this, originalCode, parameters)
        }
      } else if (code.name === 'handleStepResult') {
        const stepResult = parameters[0]

        if (stepResult.getStatus() === Cucumber.Status.FAILED) {
          code = function * () {
            try {
              yield * self._handleStepFailure(stepResult)
              originalCode.apply(this, arguments)
            } catch (err) {
              console.log(err)
            }
          }
        }
      }

      return originalUtilRun.call(this, code, world, parameters, self.options.stepTimeout, finish)
    }
  }

  * run (jsonReport) {
    yield mkdirp(path.dirname(jsonReport))
    const configuration = Cucumber.Cli.Configuration({
      name: [],
      require: this.options.stepDefinitions.concat(this.options.supportFiles),
      tags: this.options.tags,
      compiler: [],
      source: true,
      snippets: true,
      colors: true,
      format: ['pretty', 'json:' + jsonReport]
    }, this.options.featureFiles)

    const runtime = Cucumber.Runtime(configuration)

    var formatters = configuration.getFormatters()
    formatters.forEach((formatter) => {
      runtime.attachListener(formatter)
    })

    return yield new Promise((resolve, reject) => {
      runtime.start(function (succeeded) {
        return resolve(succeeded)
      })
    })
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

  * createCucumberHtmlReport (options) {
    const report = JSON.parse(yield fs.readFile(options.jsonReport))

    if (options.htmlReport) {
      cucumberHtmlReport(options.htmlReport, report)
      if (options.openReport) {
        open(options.htmlReport)
      }
    }
  }
}
