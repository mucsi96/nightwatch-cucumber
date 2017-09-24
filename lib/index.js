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

function getClientResolver (pages) {
  return new Proxy({}, {
    get: (target, name) => {
      if (name !== 'page') {
        return pages.reduce((api, pageName) => {
          return api.page[pageName]()
        }, runner.nightwatchApi.getClientApi())[name]
      }

      return new Proxy({}, {
        get: (target, pageName) => {
          return getClientResolver.bind(null, pages.concat([pageName]))
        }
      })
    }
  })
}

module.exports.client = getClientResolver([])
