'use strict'

const path = require('path')
const pify = require('pify')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const mkdirp = pify(require('mkdirp'))
const open = require('open')
const peerRequire = require('./peer-require')
const isGeneratorFn = require('is-generator').fn
const cucumberHtmlReport = require('./cucumber-html-report')
const cucumberJunitReport = require('./cucumber-junit-report')
const Cucumber = peerRequire('cucumber/lib/cucumber')

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
      fn.name.startsWith(Cucumber.Listener.EVENT_HANDLER_NAME_PREFIX) &&
      fn.name.endsWith(Cucumber.Listener.EVENT_HANDLER_NAME_SUFFIX)
  }

  isStepDefinitionAsynchronous (stepDefinition, parameters) {
    if (isGeneratorFn(stepDefinition)) return true
    if (this.options.nightwatchClientAsParameter) {
      return stepDefinition.length === parameters.length + 2
    }

    return stepDefinition.length === parameters.length + 1
  }

  addStepDefinitionRunner (stepDefinitionRunner) {
    const self = this
    const originalUtilRun = Cucumber.Util.run
    Cucumber.Util.run = function (code, world, parameters, timeoutInMilliseconds, finish) {
      const originalCode = code
      if (!self.isCucumberListener(code) && !self.isStepDefinitionAsynchronous(code, parameters)) {
        code = function * () {
          return yield * stepDefinitionRunner.call(this, originalCode, parameters)
        }
      } else if (self.isCucumberListener(code) && parameters.length && 'getAttachments' in parameters[0]) {
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

              if (attachment) stepResult.getAttachments().push(Cucumber.Runtime.Attachment(attachment))
            } catch (err) {
              console.error(err)
            }
            originalCode.apply(this, arguments)
          }
          stepResult._handledByNightwatchCucumber = true
        }
      }

      return originalUtilRun.call(this, code, self.worldProvider(), parameters, self.options.stepTimeout, finish)
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
