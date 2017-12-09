const path = require('path')
const pify = require('pify')
const co = require('co')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const Cucumber = {
  Cli: require('cucumber/lib/cli').default,
  TestCaseRunner: require('cucumber/lib/runtime/test_case_runner').default,
  UserCodeRunner: require('cucumber/lib/user_code_runner').default,
  statuses: require('cucumber/lib/status').default
}

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {
  addAttachmentProvider (attachmentProvider) {
    this.attachmentProvider = attachmentProvider
    this.injectAttachmentHandler()
  }

  * handleAttachments (testCase, stepResult, attach) {
    if (
      !this.attachmentProvider ||
        stepResult.status !== Cucumber.statuses.FAILED ||
        stepResult._handledByNightwatchCucumber
    ) return

    stepResult._handledByNightwatchCucumber = true

    try {
      const feature = path.basename(testCase.uri, path.extname(testCase.uri))
      const scenario = testCase.pickle.name
      const attachment = yield * this.attachmentProvider(feature, scenario)

      if (attachment) {
        attach(attachment)
      }
    } catch (err) {
      console.error(err.stack)
    }
  }

  injectAttachmentHandler () {
    const self = this
    const originalTestCaseRunnerInvokeStep = Cucumber.TestCaseRunner.prototype.invokeStep
    Cucumber.TestCaseRunner.prototype.invokeStep = co.wrap(function * (step, stepDefinition) {
      const result = yield originalTestCaseRunnerInvokeStep.apply(this, arguments)

      yield * self.handleAttachments(
        this.testCase,
        result,
        ({ data, mimeType }) => {
          this.emit('test-step-attachment', {
            index: this.testStepIndex,
            data,
            media: {
              type: mimeType
            }
          })
        }
      )

      return result
    })
  }

  injectTimeoutHandler () {
    const originalUserCodeRunnerRun = Cucumber.UserCodeRunner.run
    Cucumber.UserCodeRunner.run = function (props) {
      props.timeoutInMilliseconds = -1
      return originalUserCodeRunnerRun.call(this, props)
    }
  }

  * run (args) {
    const cli = new Cucumber.Cli({
      argv: process.argv.slice(0, 2).concat(args),
      cwd: process.cwd(),
      stdout: process.stdout
    })

    return yield cli.run()
  }

  getJSONReportName (args) {
    const pattern = /^json:(.*)$/
    let i = 0
    while (i < args.length - 2 && !(args[i] === '--format' && pattern.test(args[i + 1]))) {
      i++
    }
    if (i < args.length - 2) {
      return args[i + 1].match(pattern)[1]
    }
  }

  isBooleanArg (args, index) {
    const nextIndex = index + 1
    return args[nextIndex].startsWith('--') || nextIndex === args.length - 1
  }

  getFeatureFiles (args) {
    const featureFiles = []
    let i = 0
    while (i < args.length) {
      if (args[i].startsWith('--')) {
        i += this.isBooleanArg(args, i) ? 1 : 2
      } else {
        featureFiles.push(args[i])
        i++
      }
    }
    return featureFiles
  }

  getAdjustedArgs ({args, featureFiles, jsonReport, tags, skipTags}) {
    const result = []
    let i = 0
    while (i < args.length) {
      if (args[i] === '--format' && args[i + 1].startsWith('json:')) {
        result.push('--format')
        result.push(`json:${jsonReport}`)
        i += 2
      } else if (args[i].startsWith('--')) {
        result.push(args[i])
        if (this.isBooleanArg(args, i)) {
          i++
        } else {
          result.push(args[i + 1])
          i += 2
        }
      } else {
        i++
      }
    }

    if (tags.length || skipTags.length) {
      result.push('--tags')
      const joinedTags = tags.join(' or ')
      const joinedSkipTags = skipTags.map(tag => `(not ${tag})`).join(' and ')
      if (joinedTags && joinedSkipTags) {
        result.push(`(${joinedTags}) and ${joinedSkipTags}`)
      } else if (joinedTags) {
        result.push(`${joinedTags}`)
      } else if (joinedSkipTags) {
        result.push(`${joinedSkipTags}`)
      }
    }

    featureFiles.forEach((featureFile) => {
      result.push(featureFile)
    })

    return result
  }

  * mergeCucumberJsonReports (reports, target) {
    let sumReport = []
    for (let i = 0; i < reports.length; i++) {
      try {
        const report = JSON.parse(yield fs.readFile(reports[i]))
        sumReport = sumReport.concat(report)
      } catch (e) {}
      try {
        yield fs.unlink(reports[i])
      } catch (e) {}
    }
    yield fs.writeFile(target, JSON.stringify(sumReport, null, 2))
  }
}
