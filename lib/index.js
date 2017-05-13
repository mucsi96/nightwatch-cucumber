let runner

module.exports = function (providedOptions) {
  const options = Object.assign({
    cucumberArgs: [
      '--require', 'features/step_definitions',
      '--format', 'pretty',
      '--format', 'json:reports/cucumber.json',
      'features'
    ]
  }, providedOptions)

  const Runner = require('./runner')
  runner = new Runner()
  runner.run(options)
}

Object.defineProperty(module.exports, 'client', {
  get: () => {
    return runner.nightwatchApi.getClientApi()
  }
})
