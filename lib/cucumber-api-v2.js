'use strict'

const pify = require('pify')
const tmp = pify(require('tmp'), { include: ['file'] })
const path = require('path')
const mkdirp = pify(require('mkdirp'))
const Cucumber = require.main.require('cucumber/lib/cucumber')

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {

  constructor (options) {
    this.options = options
  }

  addStepDefinitionRunner (stepDefinitionRunner) {
    const originalUtilRun = Cucumber.Util.run
    Cucumber.Util.run = function (code, world, parameters, timeoutInMilliseconds, finish) {
      // Run original if not a step definition was executed
      if (!parameters.length) {
        const originalCode = code
        code = function * () {
          yield * stepDefinitionRunner.call(this, originalCode, parameters)
        }
      }

      return originalUtilRun.call(this, code, world, parameters, 30000, finish)
    }
  }

  * run (jsonReport) {
    yield mkdirp(path.dirname(jsonReport))
    const configuration = Cucumber.Cli.Configuration({
      name: [],
      require: [],
      tags: [],
      compiler: [],
      source: true,
      snippets: true,
      colors: true,
      format: ['pretty', 'json:' + jsonReport]
    }, [this.options.featureFiles])

    const runtime = Cucumber.Runtime(configuration)

    var formatters = configuration.getFormatters()
    formatters.forEach((formatter) => {
      runtime.attachListener(formatter)
    })

    yield new Promise((resolve, reject) => {
      runtime.start(function (succeeded) {
        if (!succeeded) return reject(new Error('Cucumber error'))
        return resolve()
      })
    })
  }
}
