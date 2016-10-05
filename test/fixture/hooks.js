/* eslint-env mocha */
const chai = require('chai')
chai.should()

module.exports = function () {
  this.registerHandler('BeforeFeatures', function (features, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('<F')
    cb()
  })

  this.registerHandler('BeforeFeature', function (feature, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('<f')
    cb()
  })

  this.registerHandler('BeforeScenario', function (scenario, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('<S')
    cb()
  })

  this.registerHandler('BeforeStep', function (step, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('<s')
    cb()
  })

  this.registerHandler('AfterStep', function (step, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('s>')
    cb()
  })

  this.registerHandler('AfterScenario', function (scenario, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('S>')
    cb()
  })

  this.registerHandler('AfterFeature', function (feature, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('f>')
    cb()
  })

  this.registerHandler('AfterFeatures', function (features, cb) {
    this.should.have.ownProperty('click')
    if (process.send) process.send('F>')
    cb()
  })
}
