
exports.spyPropertyReads = function(callback) {
  return {
    get: (target, prop, receiver) => {
      const r = Reflect.get(target, prop, receiver)
      const result = callback(target, `get("${prop}")`, r)
      return result
    }
  }
}
