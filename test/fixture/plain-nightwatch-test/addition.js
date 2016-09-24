module.exports = {
  'small numbers (plain Nightwatch test)': function (client) {
    client
      .init()
      .setValue('#a', 4)
      .setValue('#b', 5)
      .click('#add')
      .assert.containsText('#result', 9)
      .end()
  },
  'big numbers  (plain Nightwatch test)': function (client) {
    client
      .init()
      .setValue('#a', 4)
      .setValue('#b', 5)
      .click('#add')
      .assert.containsText('#result', 9)
      .end()
  }
}
