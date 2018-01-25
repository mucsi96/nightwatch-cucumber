const { client } = require('nightwatch-cucumber')
const { Given, Then, When } = require('cucumber')

Given(/^I open Yahoo`s search page$/, () => {
  const yahoo = client.page.yahoo()

  return yahoo
    .navigate()
    .waitForElementVisible('@body', 1000)
})
Then(/^the title is "(.*?)"$/, (text) => {
  return client.assert.title(text)
})
Then(/^the Yahoo search form exists$/, () => {
  const yahoo = client.page.yahoo()

  return yahoo.assert.visible('@searchBar')
})
