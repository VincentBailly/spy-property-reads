
exports.spyPropertyReads = function(callback) {
  return {
    get: (target, prop, receiver) => {
      const r = Reflect.get(target, prop, receiver)
      const result = callback(target, `get("${prop}")`, r)
      return result
    },
    apply: (target, thisArg, args) => {
      const r = Reflect.apply(target, thisArg, args)
      const result = callback(target, `apply()`, r)
      return result
    }
  }
}
