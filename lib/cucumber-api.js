'use strict'

const assert = require('assert')
const Cucumber = require.main.require('cucumber/lib/cucumber')

module.exports = class CucumberAPI {

  constructor (configuration) {
    this.featuresResult = Cucumber.Runtime.FeaturesResult()
    this.eventBroadcaster = Cucumber.Runtime.EventBroadcaster(configuration.getFormatters(), 5000)
  }

  * broadcastEvent (event) {
    yield * this.logLastFailedStep()
    yield new Promise((resolve, reject) => {
      this.eventBroadcaster.broadcastEvent(event, (err) => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }

  * logAfterFeatures (features) {
    const event = Cucumber.Runtime.Event(Cucumber.Events.FEATURES_EVENT_NAME, features)
    yield * this.broadcastEvent(event.replicateAsPostEvent())
  }

  * logFeaturesResult () {
    const event = Cucumber.Runtime.Event(Cucumber.Events.FEATURES_RESULT_EVENT_NAME, this.featuresResult)
    yield * this.broadcastEvent(event)
  }

  * logBeforeFeature (feature) {
    const event = Cucumber.Runtime.Event(Cucumber.Events.FEATURE_EVENT_NAME, feature)
    yield * this.broadcastEvent(event.replicateAsPreEvent())
    this.prevTime = this.getTime()
  }

  * logBackground (background) {
    const event = Cucumber.Runtime.Event(Cucumber.Events.BACKGROUND_EVENT_NAME, background)
    yield * this.broadcastEvent(event.replicateAsPreEvent())
  }

  * logBeforeScenario (scenario) {
    this.scenarioResult = Cucumber.Runtime.ScenarioResult(scenario)
    const event = Cucumber.Runtime.Event(Cucumber.Events.SCENARIO_EVENT_NAME, scenario)
    yield * this.broadcastEvent(event.replicateAsPreEvent())
    this.attachments = []
  }

  * logScenarioResult () {
    assert(this.scenarioResult)
    this.featuresResult.witnessScenarioResult(this.scenarioResult)
    const event = Cucumber.Runtime.Event(Cucumber.Events.SCENARIO_RESULT_EVENT_NAME, this.scenarioResult)
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
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i]

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
    const event = Cucumber.Runtime.Event(Cucumber.Events.STEP_RESULT_EVENT_NAME, stepResult)
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
