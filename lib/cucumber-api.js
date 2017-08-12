const pify = require('pify')
const co = require('co')
const tmp = pify(require('tmp'), { include: ['file'] })
const fs = pify(require('fs'), { include: ['readFile', 'writeFile', 'unlink'] })
const Cucumber = {
  Cli: require('cucumber/lib/cli').default,
  userCodeRunner: require('cucumber/lib/user_code_runner').default,
  Attachment: require('cucumber/lib/runtime/attachment_manager/attachment').default,
  statuses: require('cucumber/lib/status').default
}

tmp.setGracefulCleanup()

module.exports = class CucumberAPI {
  addAttachmentProvider (attachmentProvider) {
    this.attachmentProvider = attachmentProvider
    this.addStepDefinitionRunner()
  }

  isCucumberListener (fn) {
    return (/handle(Step|Features)Result/).test(fn.name) ||
      (/handle(Before|After)(Scenario|Feature|Features)/).test(fn.name)
  }

  isStepDefinitionAsynchronous (stepDefinition, parameters) {
    return stepDefinition.length === parameters.length + 1
  }

  * handleAttachments (stepResult) {
    try {
      const feature = stepResult.step.scenario.feature.name
      const scenario = stepResult.step.scenario.name
      const attachment = yield * this.attachmentProvider(feature, scenario)

      if (attachment) {
        stepResult.attachments.push(new Cucumber.Attachment({
          data: attachment.data,
          mimeType: attachment.mimeType
        }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  wrapStepDefinition (code, parameters) {
    const self = this
    if (this.isCucumberListener(code) && parameters.length && 'attachments' in parameters[0]) {
      const stepResult = parameters[0]

      if (
        this.attachmentProvider &&
          stepResult.status === Cucumber.statuses.FAILED &&
          !stepResult._handledByNightwatchCucumber
      ) {
        stepResult._handledByNightwatchCucumber = true
        return co.wrap(function * () {
          yield * self.handleAttachments(stepResult)
          code.apply(this, arguments)
        })
      }
    }

    return code
  }

  addStepDefinitionRunner () {
    const self = this
    const originalUserCodeRunnerRun = Cucumber.userCodeRunner.run
    Cucumber.userCodeRunner.run = co.wrap(function * (args) {
      args.fn = self.wrapStepDefinition(args.fn, args.argsArray)
      return yield originalUserCodeRunnerRun.call(this, args)
    })
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
      const report = JSON.parse(yield fs.readFile(reports[i]))
      sumReport = sumReport.concat(report)
      yield fs.unlink(reports[i])
    }
    yield fs.writeFile(target, JSON.stringify(sumReport, null, 2))
  }
}
