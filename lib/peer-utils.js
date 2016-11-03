'use strict'

const path = require('path')
const resolve = require('resolve')
const semver = require('semver')

function getPeerDependency (packageName) {
  let version
  let packagePath

  try {
    packagePath = resolve.sync(packageName, {
      basedir: process.cwd(),
      packageFilter: function (pkg) {
        version = pkg.version
        return pkg
      }
    })
  } catch (err) {

  }

  if (!packagePath) {
    try {
      packagePath = resolve.sync(packageName, {
        paths: require.main.paths,
        packageFilter: function (pkg) {
          version = pkg.version
          return pkg
        }
      })
    } catch (err) {

    }
  }

  if (packagePath) {
    packagePath = packagePath.replace(/node_modules(?!.*node_modules).*?$/, path.join('node_modules', packageName))
  }

  return { version, path: packagePath }
}

function checkDependency (packageName, ranges) {
  var found = false
  var version = getPeerDependency(packageName).version

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

module.exports = {
  getPeerDependency,
  checkDependency
}
