'use strict'

const fork = require('child_process').fork
const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const rimraf = require('rimraf')
const _ = require('lodash')
const nightwatchConfTemplatePath = fs.readFileSync(path.join(process.cwd(), 'test', 'fixture', 'nightwatch.conf.js.tmpl'))
const nightwatchConfTemplate = _.template(nightwatchConfTemplatePath)

class TestCaseFactory {
  constructor (name, options) {
    this.name = name
    this.options = options
    this.groups = []
    this.stepDefinitions = []
    this.pageObjects = []
    this.currentGroup = {
      features: {}
    }
    this.groups.push(this.currentGroup)
    return this
  }

  static create (name, options) {
    return new TestCaseFactory(name, options)
  }

  group (name) {
    this.currentGroup = {
      name,
      features: {}
    }
    this.groups.push(this.currentGroup)
    return this
  }

  feature (name, tags) {
    this.currentFeature = { scenarios: [], tags }
    this.currentGroup.features[name] = this.currentFeature
    return this
  }

  scenario (name) {
    this.currentScenario = { name, steps: [] }
    this.currentFeature.scenarios.push(this.currentScenario)
    return this
  }

  scenarioOutline (name) {
    this.currentScenario = { name, steps: [], examples: [] }
    this.currentFeature.scenarios.push(this.currentScenario)
    return this
  }

  background () {
    this.currentScenario = { steps: [] }
    this.currentFeature.background = this.currentScenario
    return this
  }

  given (name, stepDefinition) {
    this.context = 'Given'
    return this._step(name, 'Given', 'Given', stepDefinition)
  }

  when (name, stepDefinition) {
    this.context = 'When'
    return this._step(name, 'When', 'When', stepDefinition)
  }

  then (name, stepDefinition) {
    this.context = 'Then'
    return this._step(name, 'Then', 'Then', stepDefinition)
  }

  and (name, stepDefinition) {
    if (!this.context) throw new Error('And used without context')
    return this._step(name, 'And', this.context, stepDefinition)
  }

  _step (name, scenarioStepType, definitionType, stepDefinition) {
    if (!this.context) throw new Error('And used without context')
    this.currentScenario.steps.push({ type: scenarioStepType, name })
    if (stepDefinition) {
      const regex = `/^${name.replace(/<(.*?)>/g, '(.*?)')}$/`
      this.stepDefinitions.push(`\n  this.${definitionType}(${regex}, ${stepDefinition.toString()})\n`)
    }
    return this
  }

  example () {
    this.currentScenario.examples.push(Array.prototype.slice.call(arguments))
    return this
  }

  pageObject (name, source) {
    this.pageObjects.push({name, source})
    return this
  }

  _buildExamples (featureFile, scenario) {
    const maxColWidths = []
    fs.writeFileSync(featureFile, `\n  Examples:\n`, { flag: 'a' })
    scenario.examples.forEach((example) => {
      example.forEach((col, x) => {
        if (!maxColWidths[x] || col.length > maxColWidths[x]) {
          maxColWidths[x] = col.length
        }
      })
    })
    scenario.examples.forEach((example) => {
      const row = example.map((col, x) => {
        return pad(col, maxColWidths[x])
      })
      fs.writeFileSync(featureFile, `    | ${row.join(' | ')} |\n`, { flag: 'a' })
    })
  }

  _buildScenario (featureFile, scenario) {
    if (scenario.examples) {
      fs.writeFileSync(featureFile, `\nScenario Outline: ${scenario.name}\n\n`, { flag: 'a' })
    } else {
      fs.writeFileSync(featureFile, `\nScenario: ${scenario.name}\n\n`, { flag: 'a' })
    }
    scenario.steps.forEach((step) => {
      fs.writeFileSync(featureFile, `  ${step.type} ${step.name}\n`, { flag: 'a' })
    })

    if (scenario.examples) {
      this._buildExamples(featureFile, scenario)
    }
  }

  _buildFeatureFile (featureFile, featureName, feature) {
    if (feature.tags) {
      const tagDecleration = feature.tags.map((tag) => `@${tag}`).join(' ')
      fs.writeFileSync(featureFile, `${tagDecleration}\n`)
      fs.writeFileSync(featureFile, `Feature: ${featureName}\n`, { flag: 'a' })
    } else {
      fs.writeFileSync(featureFile, `Feature: ${featureName}\n`)
    }
    if (feature.background) {
      fs.writeFileSync(featureFile, `\nBackground:\n`, { flag: 'a' })
      feature.background.steps.forEach((step) => {
        fs.writeFileSync(featureFile, `    ${step.type} ${step.name}\n`, { flag: 'a' })
      })
    }
    feature.scenarios.forEach((scenario) => this._buildScenario(featureFile, scenario))
  }

  _buildStepDefinitions () {
    mkdirp.sync(path.join(this.testCasePath, 'features', 'step_definitions'))
    const steps = `module.exports = function () {\n${this.stepDefinitions.join('')}\n}`
    if (this.stepDefinitions.length) {
      fs.writeFileSync(path.join(this.testCasePath, 'features', 'step_definitions', 'steps.js'), steps)
    }
  }

  _buildPageObjects () {
    if (!this.pageObjects.length) return

    mkdirp.sync(path.join(this.testCasePath, 'page_objects'))
    this.pageObjects.forEach((pageObject) => {
      fs.writeFileSync(path.join(this.testCasePath, 'page_objects', `${pageObject.name}.js`), pageObject.source)
    })
  }

  _build () {
    const options = _.assign({
      pageObjects: !!this.pageObjects.length,
      paralell: false
    }, this.options)
    rimraf.sync('tmp')
    this.testCasePath = path.join(process.cwd(), 'tmp', this.name)
    mkdirp.sync(this.testCasePath)
    fs.writeFileSync(path.join(this.testCasePath, 'nightwatch.conf.js'), nightwatchConfTemplate(options))

    this._buildStepDefinitions()
    this._buildPageObjects()

    let groupPath
    this.groups.forEach((group) => {
      if (group.name) groupPath = path.join(this.testCasePath, 'features', group.name)
      else groupPath = path.join(this.testCasePath, 'features')
      mkdirp.sync(groupPath)
      Object.keys(group.features).forEach((featureName) => {
        const featureFile = path.join(groupPath, `${featureName}.feature`)
        this._buildFeatureFile(featureFile, featureName, group.features[featureName])
      })
    })
  }

  run (runner, args) {
    this._build()
    args = args || []

    const istanbulPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'istanbul', 'lib', 'cli.js'))
    const istanbulConfig = path.resolve(path.join(__dirname, '..', '.istanbul.yml'))
    const istanbulRoot = path.resolve(path.join(__dirname, '..', 'lib'))
    const istanbulDir = path.resolve(path.join(__dirname, '..', 'coverage', this.name))
    const nightwatchPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'nightwatch', 'bin', 'runner.js'))

    return new Promise((resolve, reject) => {
      const origArgs = args.slice()
      args.unshift(
        'cover',
        nightwatchPath,
        '--config', istanbulConfig,
        '--root', istanbulRoot,
        '--dir', istanbulDir,
        '--report', 'json',
        '--print', 'none',
        '--'
      )
      console.log('Executing > ', nightwatchPath, origArgs.join(' '))
      const nightwatch = fork(istanbulPath, args, {
        stdio: [0, 'pipe', 'pipe', 'ipc'],
        cwd: this.testCasePath
      })

      nightwatch.stdout.pipe(process.stdout)
      nightwatch.stderr.pipe(process.stderr)

      const output = []
      const addToOutput = (data) => output.push(data)

      nightwatch.stdout.on('data', addToOutput)
      nightwatch.stderr.on('data', addToOutput)

      nightwatch.on('close', () => {
        resolve({ report: this.getCucumberReport(), output: output.join('') })
      })
    })
  }

  getCucumberReport () {
    try {
      const jsonReport = path.join(this.testCasePath, 'reports', 'cucumber.json')
      const json = fs.readFileSync(jsonReport, 'utf8')
      const result = JSON.parse(json)
      return this.enhaceResult(result)
    } catch (err) {
      return
    }
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

function pad (value, length) {
  return (value.toString().length < length) ? pad(value + ' ', length) : value
}
module.exports = TestCaseFactory
