/* global client */
const testCaseFactory = require('../test/test-case-factory')
const examples = {
  background
}

function background () {
  return testCaseFactory
    .create('background-example')
    .feature('Background support')
    .background()
    .given('I open Google`s search page', () => {
      return client
        .url('http://google.com')
        .waitForElementVisible('body', 1000)
    })
    .scenario('Addition')
    .when('I search for "500+120"', (text) => {
      return client
        .setValue('input[name=q]', text)
        .submitForm('input[name=q]')
    })
    .then('the search result should contain "620"', (text) => {
      return client.assert.containsText('body', text)
    })
    .scenario('Division')
    .when('I search for "36/6"')
    .then('the search result should contain "6"')
}

Object.keys(examples).forEach((name) => {
  examples[name]().build({examples: true})
})
