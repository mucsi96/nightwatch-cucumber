'use strict'

const co = require('co')

function addCallbackedHookBefore (target, functionName, callbackIndex, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    const self = this
    const args = Array.prototype.slice.call(arguments)

    return co.wrap(hook).apply(self, args)
      .then(() => original.apply(this, args))
      .catch((err) => { console.error(err); throw err })
  }
}

function addCallbackedHookAfter (target, functionName, callbackIndex, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    const args = Array.prototype.slice.call(arguments)
    const callback = args[callbackIndex]
    args[callbackIndex] = function () {
      const self = this
      const callbackArgs = Array.prototype.slice.call(arguments)
      return co.wrap(hook).apply(self, callbackArgs)
        .then(() => callback.apply(this, callbackArgs))
        .catch((err) => { console.error(err); throw err })
    }
    return original.apply(this, args)
  }
}

function addPromisedHookBefore (target, functionName, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    return co.wrap(hook).apply(this)
      .then(() => original.apply(this, arguments))
  }
}

function addPromisedHookAfter (target, functionName, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    return original.apply(this, arguments)
      .then(() => co.wrap(hook).apply(this))
  }
}

module.exports = {
  addCallbackedHookBefore,
  addCallbackedHookAfter,
  addPromisedHookBefore,
  addPromisedHookAfter
}
