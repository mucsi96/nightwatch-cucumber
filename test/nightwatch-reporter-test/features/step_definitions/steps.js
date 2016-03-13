module.exports = function () {
  this.Given(/^I open Google's search page$/, function () {
    this
      .url('http://google.com')
      .waitForElementVisible('body', 1000)
  })

  this.When(/^I search for (.*)$/, function (expression) {
    this
      .setValue('input[name=q]', expression)
      .submitForm('input[name=q]')
  })

  this.Then(/^the search result should contain (.*)$/, function (result) {
    this.assert.containsText('body', result)
  })

  this.Then(/^the title is "([^"]*)"$/, function (title) {
    this.assert.title(title)
  })

  this.Given(/^I open Yahoo's search page$/, function () {
    this
      .url('http://yahoo.com')
      .waitForElementVisible('body', 1000)
  })

  this.Then(/^the Yahoo search form exists$/, function () {
    this.assert.visible('input[name="p"]')
  })
}
