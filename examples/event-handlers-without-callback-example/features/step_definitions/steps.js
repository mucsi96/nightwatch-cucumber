const { client } = require('nightwatch-cucumber')
const { defineSupportCode } = require('cucumber')

defineSupportCode(({ Given, Then, When }) => {
  Given(/^I open Google`s search page$/, () => {
    return client
      .url('http://google.com')
      .waitForElementVisible('body', 1000)
  })

  Then(/^the title is "(.*?)"$/, (text) => {
    return client.assert.title(text)
  })

  Then(/^the Google search form exists$/, () => {
    return client.assert.visible('input[name="q"]')
  })

  Given(/^I open Yahoo`s search page$/, () => {
    return client
      .url('http://yahoo.com')
      .waitForElementVisible('body', 1000)
  })

  Then(/^the Yahoo search form exists$/, () => {
    return client.assert.visible('input[name="p"]')
  })
})