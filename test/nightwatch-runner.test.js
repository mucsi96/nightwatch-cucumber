/* eslint-env mocha */
const chai = require('chai')
chai.should()
const utils = require('./test-utils')

describe('Nightwatch runner', () => {
  it('should handle simple tests', (done) => {
    return utils.runTest('nightwatch-simple-test')
      .then((result) => {
        result.length.should.equal(1)
      })
      .then(done, done)
  })
})
