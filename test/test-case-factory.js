'use strict'

const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const nightwatchConfTemplate = fs.readFileSync(path.join(process.cwd(), 'test', 'fixture', 'nightwatch.conf.tmpl.js'))

class TestCaseFactory {
  constructor (name) {
    this.name = name
    this.features = {}
    return this
  }

  static create (name) {
    return new TestCaseFactory(name)
  }

  feature (name) {
    this.currentFeature = { scenarios: [] }
    this.features[name] = this.currentFeature
    return this
  }

  scenario (name) {
    this.currentScenario = { name, steps: [] }
    this.currentFeature.scenarios.push(this.currentScenario)
    return this
  }

  given (name) {
    this.currentScenario.steps.push({ type: 'Given', name })
    return this
  }

  when (name) {
    this.currentScenario.steps.push({ type: 'When', name })
    return this
  }

  then (name) {
    this.currentScenario.steps.push({ type: 'Then', name })
    return this
  }

  and (name) {
    this.currentScenario.steps.push({ type: 'And', name })
    return this
  }

  build () {
    rimraf.sync('tmp')
    const testCasePath = path.join(process.cwd(), 'tmp', this.name)
    mkdirp.sync(testCasePath)
    fs.writeFileSync(path.join(testCasePath, 'nightwatch.conf.js'), nightwatchConfTemplate)
    mkdirp.sync(path.join(testCasePath, 'features', 'step_definitions'))
    Object.keys(this.features).forEach((featureName) => {
      const featureFile = path.join(testCasePath, 'features', `${featureName}.js`)
      fs.writeFileSync(featureFile, `Feature: ${featureName}\n\n`)
      this.features[featureName].scenarios.forEach((scenario) => {
        fs.writeFileSync(featureFile, `Scenario: ${scenario.name}\n\n`, { flag: 'a' })
        scenario.steps.forEach((step) => {
          fs.writeFileSync(featureFile, `${step.type} ${step.name}\n`, { flag: 'a' })
        })
      })
    })
  }
}

module.exports = TestCaseFactory
