'use strict'

const fork = require('child_process').fork
const mkdirp = require('mkdirp')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const PrefixStream = require('../lib/prefix-stream')
const nightwatchConfTemplatePath = fs.readFileSync(path.join(process.cwd(), 'test', 'fixture', 'nightwatch.conf.js.tmpl'))
const nightwatchConfTemplate = _.template(nightwatchConfTemplatePath)

class TestCaseFactory {
  constructor (name, options) {
    this.name = name
    this.options = _.assign({
      paralell: false,
      hooks: false,
      eventHandlersWithoutCallback: false,
      eventHandlersWithCallback: false,
      includePlainNightwatchTests: false,
      noTests: false,
      badFeatureFile: false,
      junitReport: false,
      screenshots: false,
      gulp: false,
      grunt: false,
      programmatical: false,
      nightwatchClientAsParameter: false
    }, options)
    this.groups = []
    this.stepDefinitions = []
    this.pageObjects = []
    this.customCommands = []
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

  scenario (name, tags) {
    this.currentScenario = { name, steps: [], tags }
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
      const namePattern = name
        .replace(/<(.*?)>/g, '(.*?)')
        .replace(/"(.*?)"/g, '"(.*?)"')
      const regex = `/^${namePattern}$/`
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

  customCommand (name, source) {
    this.customCommands.push({name, source})
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
    if (scenario.tags) {
      const tagDecleration = scenario.tags.map((tag) => `@${tag}`).join(' ')
      fs.writeFileSync(featureFile, `${tagDecleration}\n`, { flag: 'a' })
    }

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
    } else {
      fs.writeFileSync(featureFile, ``)
    }

    const featureWord = !this.options.badFeatureFile ? 'Feature' : 'Featre'
    fs.writeFileSync(featureFile, `${featureWord}: ${featureName}\n`, { flag: 'a' })

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

  _buildCustomCommands () {
    if (!this.customCommands.length) return

    mkdirp.sync(path.join(this.testCasePath, 'custom_commands'))
    this.customCommands.forEach((customCommand) => {
      fs.writeFileSync(path.join(this.testCasePath, 'custom_commands', `${customCommand.name}.js`), customCommand.source)
    })
  }

  _build () {
    this.options.pageObjects = !!this.pageObjects.length
    this.options.customCommands = !!this.customCommands.length
    this.testCasePath = path.join(process.cwd(), 'tmp', this.name)
    mkdirp.sync(this.testCasePath)
    fs.writeFileSync(path.join(this.testCasePath, 'nightwatch.conf.js'), nightwatchConfTemplate(this.options))

    if (this.options.gulp) {
      copyFixture('gulpfile.js', this.testCasePath)
    } else if (this.options.grunt) {
      copyFixture('Gruntfile.js', this.testCasePath)
    } else if (this.options.programmatical) {
      copyFixture('programmatical-run.js', this.testCasePath)
    }

    this._buildStepDefinitions()
    this._buildPageObjects()
    this._buildCustomCommands()

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

  _cover (runnerPath, args) {
    const istanbulPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'istanbul', 'lib', 'cli.js'))
    const istanbulConfig = path.resolve(path.join(__dirname, '..', '.istanbul.yml'))
    const istanbulRoot = path.resolve(path.join(__dirname, '..', 'lib'))
    const istanbulDir = path.resolve(path.join(__dirname, '..', 'coverage', this.name))
    args = args.slice()
    args.unshift(
      'cover',
      runnerPath,
      '--config', istanbulConfig,
      '--root', istanbulRoot,
      '--dir', istanbulDir,
      '--report', 'json',
      '--print', 'none',
      '--'
    )
    return {
      path: istanbulPath,
      args
    }
  }

  _forkChild (runnerPath, args) {
    return new Promise((resolve, reject) => {
      console.log('')
      const command = this._cover(runnerPath, args)
      const child = fork(command.path, command.args, {
        silent: true,
        cwd: this.testCasePath
      })

      child.stdout.pipe(new PrefixStream('    |  ', 105)).pipe(process.stdout)
      child.stderr.pipe(new PrefixStream('    |  ', 105)).pipe(process.stderr)

      const output = []
      const ipcMessages = []
      const collectOutput = (data) => output.push(data)
      const collectIpcMessages = (data) => ipcMessages.push(data)

      child.stdout.on('data', collectOutput)
      child.stderr.on('data', collectOutput)
      child.on('message', collectIpcMessages)

      child.on('close', (exitCode) => {
        console.log('')
        resolve({
          features: this.getCucumberReport(),
          output: output.join(''),
          ipcMessages,
          testCasePath: this.testCasePath,
          exitCode
        })
      })
    })
  }

  run (args) {
    let runnerPath
    this._build()
    args = args || []

    if (this.options.gulp) {
      runnerPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'gulp', 'bin', 'gulp.js'))
    } else if (this.options.grunt) {
      runnerPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'grunt', 'bin', 'grunt'))
    } else if (this.options.programmatical) {
      runnerPath = path.resolve(path.join(this.testCasePath, 'programmatical-run.js'))
    } else {
      runnerPath = path.resolve(path.join(__dirname, '..', 'node_modules', 'nightwatch', 'bin', 'runner.js'))
    }

    return this._forkChild(runnerPath, args)
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
        if (element.keyword !== 'Scenario') return

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

function copyFixture (name, dest) {
  fs.createReadStream(path.join(process.cwd(), 'test', 'fixture', name))
        .pipe(fs.createWriteStream(path.join(dest, name)))
}

module.exports = TestCaseFactory
