'use strict'

const tmp = require('tmp')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')
const Cucumber = require.main.require('cucumber/lib/cucumber')
const tempLogFile = tmp.fileSync({ unsafeCleanup: true }).name

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {

  constructor (options) {
    this.options = options
  }

  setStepDefinitionTrap (stepDefinitionTrap) {
    this.stepDefinitionTrap = stepDefinitionTrap
  }

  hookUp () {
    const self = this
    const originalUtilRun = Cucumber.Util.run
    Cucumber.Util.run = function (code, world, parameters, timeoutInMilliseconds, finish) {
      // Run original if not a step definition was executed
      if (!parameters.length) {
        if (self.stepDefinitionTrap) {
          const originalCode = code
          code = function * () {
            yield * self.stepDefinitionTrap.call(this, originalCode)
          }
        }

        if (self.world) {
          world = self.world
        }
      }

      return originalUtilRun.call(this, code, world, parameters, 30000, finish)
    }
  }

  * saveJsonReport () {
    if (!fs.existsSync(tempLogFile)) return

    const json = fs.readFileSync(tempLogFile, 'utf8')

    if (this.options.jsonReport) {
      mkdirp.sync(path.dirname(this.options.jsonReport))
      fs.writeFileSync(this.options.jsonReport, json)
    }
  }

  * run (world, featureFile) {
    const configuration = Cucumber.Cli.Configuration({
      name: [],
      require: [],
      tags: [],
      compiler: [],
      source: true,
      snippets: true,
      colors: true,
      format: ['pretty', 'json:' + tempLogFile]
    }, [featureFile])

    this.runtime = Cucumber.Runtime(configuration)
    this.world = world

    var formatters = configuration.getFormatters()
    formatters.forEach((formatter) => {
      this.runtime.attachListener(formatter)
    })

    yield new Promise((resolve, reject) => {
      this.runtime.start(function (succeeded) {
        if (!succeeded) return reject(new Error('Cucumber error'))
        return resolve()
      })
    })

    yield * this.saveJsonReport()
  }
}
