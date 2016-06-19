const spawn = require('child_process').spawn
const path = require('path')
const fs = require('fs')

function runTest (testCase) {
  const nightwatchBin = path.resolve(path.join(__dirname, '..', 'node_modules', '.bin', 'nightwatch'))
  const testCasePath = path.join(__dirname, testCase)

  return new Promise((resolve, reject) => {
    const nightwatch = spawn(nightwatchBin, [], {
      stdio: 'inherit',
      cwd: testCasePath
    })

    nightwatch.on('close', () => {
      try {
        const jsonReport = path.join(testCasePath, 'reports', 'cucumber.json')
        const json = fs.readFileSync(jsonReport, 'utf8')
        const result = JSON.parse(json)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    })
  })
}

module.exports = {
  runTest
}
