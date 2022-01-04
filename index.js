
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
    },
    getOwnPropertyDescriptor: (target, prop) => {
      const desc = Reflect.getOwnPropertyDescriptor(target, prop)
      if (desc.value !== undefined) {
        return {
          ...desc,
          get value() {
            return callback(target, `getOwnPropertyDescriptor("${prop}").value`, desc.value)
          }
        }
      }
      if (desc.get !== undefined) {
        return {
          ...desc,
          get() {
            return callback(target, `getOwnPropertyDescriptor("${prop}").get()`, desc.get())
          }
        }
        return desc
      }
    },
    getPrototypeOf: (target) => {
      const r = Reflect.getPrototypeOf(target)
      const result = callback(target, `getPrototypeOf()`, r)
      return result
    },
  }
}
