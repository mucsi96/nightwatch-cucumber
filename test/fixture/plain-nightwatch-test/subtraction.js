module.exports = {
  'small numbers  (plain Nightwatch test)': function (client) {
    client
      .init()
      .setValue('#a', 9)
      .setValue('#b', 3)
      .click('#subtract')
      .assert.containsText('#result', 6)
      .end()
  },
  'big numbers  (plain Nightwatch test)': function (client) {
    client
      .init()
      .setValue('#a', 9)
      .setValue('#b', 3)
      .click('#subtract')
      .assert.containsText('#result', 6)
      .end()
  }
}
