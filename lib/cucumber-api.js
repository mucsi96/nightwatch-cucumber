'use strict'

const path = require('path')
const pify = require('pify')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const mkdirp = pify(require('mkdirp'))
const open = require('open')
const peerRequire = require('./peer-require')
const cucumberHtmlReport = require('./cucumber-html-report')
const Cucumber = peerRequire('cucumber/lib/cucumber')

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {

  constructor (options) {
    this.options = options
  }

  addAttachmentProvider (attachmentProvider) {
    this.attachmentProvider = attachmentProvider
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
      } else if (parameters.length && 'getAttachments' in parameters[0]) {
        const stepResult = parameters[0]

        if (
            self.attachmentProvider &&
            stepResult.getStatus() === Cucumber.Status.FAILED &&
            !stepResult._handledByNightwatchCucumber
          ) {
          code = function * () {
            try {
              const feature = stepResult.getStep().getScenario().getFeature().getName()
              const scenario = stepResult.getStep().getScenario().getName()
              const attachment = yield * self.attachmentProvider(feature, scenario)
              stepResult.getAttachments().push(Cucumber.Runtime.Attachment(attachment))
            } catch (err) {
              console.error(err)
            }
            originalCode.apply(this, arguments)
          }
          stepResult._handledByNightwatchCucumber = true
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
