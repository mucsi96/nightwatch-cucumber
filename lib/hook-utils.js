const co = require('co')

function addHookBefore (target, functionName, hook) {
  const original = target[functionName]

  target[functionName] = function () {
    hook.apply(this, arguments)
    return original.apply(this, arguments)
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
    }
    return original.apply(this, args)
  }
}

module.exports = {
  addHookBefore,
  addCallbackedHookAfter
}
