var path = require('path')
var resolve = require('resolve')
var semver = require('semver')

function getPeerDependencyVersion (packageName) {
  var version

  try {
    resolve.sync(packageName, {
      basedir: path.dirname(require.main.filename),
      packageFilter: function (pkg) {
        version = pkg.version
        return pkg
      }
    })
  } catch (err) {}

  return version
}

function checkDependency (packageName, ranges) {
  var found = false
  var version = getPeerDependencyVersion(packageName)

  Object.keys(ranges).forEach(function (range) {
    if (semver.satisfies(version, range)) {
      found = true
      ranges[range](packageName, version)
    }
  })

  if (found) return

  if (version && !found) {
    return ranges.other(packageName, version)
  }

  return ranges.notFound(packageName, version)
}

module.exports = checkDependency
