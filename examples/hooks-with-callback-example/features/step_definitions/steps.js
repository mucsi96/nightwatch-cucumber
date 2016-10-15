module.exports = function () {
  this.Given(/^I open Google's search page$/, function () {
    this
      .url('https://www.google.co.uk')
      .waitForElementVisible('body', 1000)
  })

  this.Then(/^the title is "([^"]*)"$/, function (title) {
    this.assert.title(title)
  })

  this.Then(/^the Google search form exists$/, function () {
    this.assert.visible('input[name="q"]')
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
