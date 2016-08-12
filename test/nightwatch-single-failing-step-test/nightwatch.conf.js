const config = require('./globals')
const seleniumServer = require('selenium-server')
const chromedriver = require('chromedriver')

var nightwatchCucumber = require('nightwatch-cucumber')({
    openReport: true,
    beforeScenario: function(browser, cb) {
        console.log('Runs before each scenario')
        cb()
    },
    beforeStep: function(browser) {
        console.log('Runs before each step')
    },
    afterScenario: function(browser, cb) {
        console.log('Runs after each scenario')
        cb()
    },
    afterStep: function(browser) {
        console.log('Runs after each step')
    }
})

module.exports = {
    "src_folders": [nightwatchCucumber],
    "output_folder": "reports",
    featureFiles: './features',
    stepDefinitions: './features/step_definitions',
    closeSession: 'afterFeature',
    "custom_commands_path": "",
    "custom_assertions_path": "",
    "page_objects_path": "./pages",
    "globals_path": "./globals.js",


    "selenium": {
        "start_process": true,
        "server_path": seleniumServer.path,
        "log_path": "./reports",
        "host": "127.0.0.1",
        "port": 4444,
        "cli_args": {
            "webdriver.chrome.driver": chromedriver.path
        }
    },

    "test_settings": {

        "default": {
            "launch_url": "http://localhost",
            "selenium_port": 4444,
            "selenium_host": "localhost",
            "silent": false,
            "desiredCapabilities": {
                "browserName": "chrome",
                "javascriptEnabled": true,
                "acceptSslCerts": true
            }
        }
    }
};
