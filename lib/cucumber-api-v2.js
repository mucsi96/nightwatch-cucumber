'use strict'

const tmp = require('tmp')
const Cucumber = require.main.require('cucumber/lib/cucumber')
const tempLogFile = tmp.fileSync({ unsafeCleanup: true }).name

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {
  * run (featureFile) {
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

    var formatters = configuration.getFormatters()
    formatters.forEach((formatter) => {
      this.runtime.attachListener(formatter)
    })

    yield new Promise((resolve, reject) => {
      this.runtime.start(function (err) {
        if (err) return reject(err)
        return resolve()
      })
    })
  }
}
