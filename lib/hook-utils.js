const co = require('co')

function addCallbackedHookBefore (target, functionName, callbackIndex, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    const self = this
    const args = Array.prototype.slice.call(arguments)

    return co(function * () {
      yield * hook.apply(self, args)
    })
      .then(() => original.apply(this, args))
      .catch((err) => { console.log(err); throw err })
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
      return co(function * () {
        yield * hook.apply(self, callbackArgs)
      })
        .then(() => callback.apply(this, callbackArgs))
        .catch((err) => { console.log(err); throw err })
    }
    return original.apply(this, args)
  }
}

function addPromisedHookBefore (target, functionName, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    return co(hook.bind(this))
      .then(() => original.apply(this, arguments))
      .catch((err) => { console.log(err); throw err })
  }
}

module.exports = {
  addCallbackedHookBefore,
  addCallbackedHookAfter,
  addPromisedHookBefore
}
