'use strict'

const fork = require('child_process').fork
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

  _build () {
    rimraf.sync('tmp')
    this.testCasePath = path.join(process.cwd(), 'tmp', this.name)
    mkdirp.sync(this.testCasePath)
    fs.writeFileSync(path.join(this.testCasePath, 'nightwatch.conf.js'), nightwatchConfTemplate)
    mkdirp.sync(path.join(this.testCasePath, 'features', 'step_definitions'))
    Object.keys(this.features).forEach((featureName) => {
      const featureFile = path.join(this.testCasePath, 'features', `${featureName}.feature`)
      fs.writeFileSync(featureFile, `Feature: ${featureName}\n\n`)
      this.features[featureName].scenarios.forEach((scenario) => {
        fs.writeFileSync(featureFile, `Scenario: ${scenario.name}\n\n`, { flag: 'a' })
        scenario.steps.forEach((step) => {
          fs.writeFileSync(featureFile, `${step.type} ${step.name}\n`, { flag: 'a' })
        })
      })
    })
  }

  run () {
    this._build()
    const nightwatchPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'nightwatch', 'bin', 'runner.js'))

    return new Promise((resolve, reject) => {
      const nightwatch = fork(nightwatchPath, [], {
        stdio: 'inherit',
        cwd: this.testCasePath
      })

      nightwatch.on('close', () => {
        try {
          const jsonReport = path.join(this.testCasePath, 'reports', 'cucumber.json')
          const json = fs.readFileSync(jsonReport, 'utf8')
          const result = JSON.parse(json)
          resolve(this.enhaceResult(result))
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  enhaceResult (result) {
    result.forEach((feature) => {
      let featureResult = {
        scenarioCounts: {}
      }

      let scenarios = []

      feature.elements.forEach((element) => {
        if (element.type !== 'scenario') return

        scenarios.push(element)

        let scenarioResult = {
          status: 'passed',
          stepCounts: {}
        }

        element.steps.forEach((step) => {
          let stepStatus = step.result.status
          if (this.shouldUpdateStatus(scenarioResult.status, stepStatus)) {
            scenarioResult.status = stepStatus
          }

          if (typeof scenarioResult.stepCounts[stepStatus] !== 'number') {
            scenarioResult.stepCounts[stepStatus] = 1
          } else {
            scenarioResult.stepCounts[stepStatus] += 1
          }
        })

        Object.assign(element, { result: scenarioResult })

        if (typeof featureResult.scenarioCounts[scenarioResult.status] !== 'number') {
          featureResult.scenarioCounts[scenarioResult.status] = 1
        } else {
          featureResult.scenarioCounts[scenarioResult.status] += 1
        }
      })

      if (featureResult.scenarioCounts.failed > 0 || featureResult.scenarioCounts.ambiguous > 0) {
        featureResult.status = 'failed'
      } else {
        featureResult.status = 'passed'
      }

      Object.assign(feature, { result: featureResult, scenarios })
    })

    return result
  }

  shouldUpdateStatus (status, stepStatus) {
    switch (stepStatus) {
      case 'failed':
        return true
      case 'ambiguous':
      case 'pending':
      case 'skipped':
      case 'undefined':
        return status === 'passed'
      default:
        return false
    }
  }
}

module.exports = TestCaseFactory
