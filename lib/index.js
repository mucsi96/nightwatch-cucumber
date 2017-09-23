let runner

module.exports = function (providedOptions) {
  const options = Object.assign({
    cucumberArgs: [
      '--require', 'features/step_definitions',
      '--format', 'json:reports/cucumber.json',
      'features'
    ],
    nightwatchOutput: true
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
