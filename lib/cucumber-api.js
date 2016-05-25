'use strict'

const assert = require('assert')
const Cucumber = require.main.require('cucumber/lib/cucumber')

module.exports = class CucumberAPI {

  constructor (configuration) {
    this.formatters = configuration.getFormatters()
    this.featuresResult = Cucumber.Runtime.FeaturesResult()
  }

  * broadcastEvent (event) {
    const jobs = this.formatters.map((formatter) => {
      return new Promise((resolve) => {
        formatter.hear(event, resolve)
      })
    })

    yield * this.logLastFailedStep()
    yield jobs
  }

  * logAfterFeatures (features) {
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURES_EVENT_NAME, { features: features })
    yield * this.broadcastEvent(event.replicateAsPostEvent())
  }

  * logFeaturesResult () {
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURES_RESULT_EVENT_NAME, { featuresResult: this.featuresResult })
    yield * this.broadcastEvent(event)
  }

  * logBeforeFeature (feature) {
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.FEATURE_EVENT_NAME, { feature: feature })
    yield * this.broadcastEvent(event.replicateAsPreEvent())
    this.prevTime = this.getTime()
  }

  * logBackground (background) {
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.BACKGROUND_EVENT_NAME, { background: background })
    yield * this.broadcastEvent(event.replicateAsPreEvent())
  }

  * logBeforeScenario (scenario) {
    this.scenarioResult = Cucumber.Runtime.ScenarioResult(scenario)
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_EVENT_NAME, { scenario: scenario })
    yield * this.broadcastEvent(event.replicateAsPreEvent())
    this.attachments = []
  }

  * logScenarioResult () {
    assert(this.scenarioResult)
    this.featuresResult.witnessScenarioResult(this.scenarioResult)
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.SCENARIO_RESULT_EVENT_NAME, { scenarioResult: this.scenarioResult })
    yield * this.broadcastEvent(event)
  }

  * logAmbiguousStep (step) {
    const ambiguousStepResult = Cucumber.Runtime.StepResult({
      ambiguousStepDefinitions: step.stepDefinitions,
      step: step,
      status: Cucumber.Status.AMBIGUOUS
    })
    yield * this.logStepResult(ambiguousStepResult)
  }

  * logUndefinedStep (step) {
    const undefinedStepResult = Cucumber.Runtime.StepResult({ step: step, status: Cucumber.Status.UNDEFINED })
    yield * this.logStepResult(undefinedStepResult)
  }

  * logSkippedStep (step) {
    const undefinedStepResult = Cucumber.Runtime.StepResult({
      step: step,
      stepDefinition: step.stepDefinitions[0],
      status: Cucumber.Status.SKIPPED
    })
    yield * this.logStepResult(undefinedStepResult)
  }

  * logPassedStep (step) {
    if (step.reported) return

    const passedStepResult = Cucumber.Runtime.StepResult({
      step: step,
      stepDefinition: step.stepDefinitions[0],
      duration: this.durationInNanoseconds(this.prevTime),
      attachments: [],
      status: Cucumber.Status.PASSED
    })
    yield * this.logStepResult(passedStepResult)
  }

  * logFailedStep (step, failure, skipRemainingSteps) {
    if (step.reported) return

    yield * this.logLastFailedStep()
    this.lastFailedStepResultData = {
      step: step,
      stepDefinition: step.stepDefinitions[0],
      duration: this.durationInNanoseconds(this.prevTime),
      attachments: [],
      failureException: failure,
      status: Cucumber.Status.FAILED,
      skipRemainingSteps: skipRemainingSteps
    }
    step.reported = true
  }

  * logLastFailedStep () {
    if (this.lastFailedStepResultData) {
      this.lastFailedStepResultData.attachments = this.attachments
      const failedStepResult = Cucumber.Runtime.StepResult(this.lastFailedStepResultData)
      const stepResultData = this.lastFailedStepResultData
      this.lastFailedStepResultData = undefined
      yield * this.logStepResult(failedStepResult)

      if (stepResultData.skipRemainingSteps) {
        const steps = stepResultData.step.getScenario().getSteps()
        let skip = false
        for (let i = 0; i < steps.length(); i++) {
          const step = steps.getAtIndex(i)

          if (skip) {
            yield * this.logSkippedStep(step)
          }

          if (step === stepResultData.step) skip = true
        }
      }
    }
  }

  * logStepResult (stepResult) {
    this.scenarioResult.witnessStepResult(stepResult)
    this.featuresResult.witnessStepResult(stepResult)
    const event = Cucumber.Runtime.AstTreeWalker.Event(Cucumber.Runtime.AstTreeWalker.STEP_RESULT_EVENT_NAME, { stepResult: stepResult })
    yield * this.broadcastEvent(event)
    this.prevTime = this.getTime()
  }

  * addAttachment (data, mimeType) {
    this.attachments.push(Cucumber.Runtime.Attachment({ mimeType: mimeType, data: new VirtualString(data) }))
  }

  getTime () {
    if (typeof process !== 'undefined' && process.hrtime) {
      return process.hrtime()
    } else {
      return new Date().getTime()
    }
  }

  durationInNanoseconds (start) {
    if (typeof process !== 'undefined' && process.hrtime) {
      const duration = process.hrtime(start)
      return duration[0] * 1e9 + duration[1]
    } else {
      return (new Date().getTime() - start) * 1e6
    }
  }
}

class VirtualString {
  constructor (data) {
    this.data = new Buffer(data, 'base64')
    this.length = this.data.length
  }

  charCodeAt (index) {
    return this.data[index]
  }
}
