var path = require('path')
var objectAssign = require('object-assign')
var nightwatch = require.main.require('nightwatch')
var client

function World () {
  objectAssign(this, client.api)
}

function bootstrap (options) {
  var cliRunner
  var clientManager

  if (this.BeforeFeatures && this.AfterFeatures) {
    this.BeforeFeatures(function (event, done) {
      cliRunner = nightwatch.CliRunner(process.argv)
      cliRunner.setup()
      clientManager = nightwatch.initClient(cliRunner.test_settings)
      client = clientManager.get()
      client.options.output = false
      cliRunner.startSelenium(function () {
        done()
      })
    })

    this.AfterFeatures(function (event, done) {
      client.on('nightwatch:finished', function () {
        cliRunner.stopSelenium(done)
      })
      client.terminate()
    })
  }

  if (this.World) {
    this.Before(function (event, done) {
      var filePath = event.getUri()
      client.queue.empty()
      client.api.currentTest = {
        name: path.basename(filePath, '.feature'),
        module: ''
      }
      client.resetTerminated()
      client.clearResult()
      delete client.results.lastError
      done()
    })

    this.After(function (event, done) {
      client.once('nightwatch:finished', function (results) {
        var err = client.results.lastError

        if (err) {
          return done(err.message + '\n' + err.stack)
        }

        return done()
      })
      client.start()
    })
  }

  this.World = World
  return __filename
}

module.exports = bootstrap
