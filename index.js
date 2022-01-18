exports.spyPropertyReads = function(callback, handler = {}) {
  function reflect(method, ...args) {
    return () => {
      if (handler[method]) {
        return handler[method](...args)
      }
      return Reflect[method](...args)
    }
  }

  return {
    ...handler,
    get: (target, prop, receiver) => {
      const r = reflect('get', target, prop, receiver)
      const result = callback(target, `get("${prop.toString()}")`, r)
      return result
    },
    apply: (target, thisArg, args) => {
      const r = reflect('apply', target, thisArg, args)
      const result = callback(target, `apply()`, r)
      return result
    },
    getOwnPropertyDescriptor: (target, prop) => {
      const desc = reflect('getOwnPropertyDescriptor', target, prop)()
      if (!desc) { return desc }
      if (desc.value !== undefined) {
        return {
          ...desc,
          get value() {
            return callback(target, `getOwnPropertyDescriptor("${prop.toString()}").value`, () => desc.value)
          }
        }
      }
      if (desc.get !== undefined) {
        return {
          ...desc,
          get() {
            return callback(target, `getOwnPropertyDescriptor("${prop.toString()}").get()`, desc.get)
          }
        }
        return desc
      }
    },
    getPrototypeOf: (target) => {
      const r = reflect('getPrototypeOf', target)
      const result = callback(target, `getPrototypeOf()`, r)
      return result
    },
  }
}
