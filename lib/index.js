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

function getPageProxy (subPages) {
  return new Proxy(() => getClientProxy(subPages), {
    get: (target, pageName) => getPageProxy(subPages.concat([pageName]))
  })
}

function getClientProxy (subPages) {
  return new Proxy({}, {
    get: (target, name) => {
      if (name !== 'page') {
        const api = runner.nightwatchApi.getClientApi()

        if (!subPages.length) {
          return api[name]
        }

        return subPages.reduce((api, pageName) => {
          return api[pageName]
        }, api.page)()[name]
      }

      return getPageProxy([])
    }
  })
}

module.exports.client = getClientProxy([])
