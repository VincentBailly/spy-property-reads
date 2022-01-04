const { spyPropertyReads } = require('..')
const tap = require('tap')

tap.test('getters are trapped', t => {
  const o = { a: 42, b: 41 }

  const calls = []
  const spyCallback = function(source, query, getResult) {
    const result = getResult()
    calls.push({ source, query, result })
    if (result === 41) {
      // testing that we can override results
      return 21
    }
    return result
  }

  const handler = spyPropertyReads(spyCallback)
  const spy = new Proxy(o, handler)

  // accessing 42 using the property 'a'
  t.equal(spy.a, 42, 'property getter work')
  t.equal(calls[0].source, o)
  t.equal(calls[0].query, 'get("a")')
  t.equal(calls[0].result, 42)

  t.equal(spy.b, 21, 'property getter work')
  t.equal(calls[1].source, o)
  t.equal(calls[1].query, 'get("b")')
  t.equal(calls[1].result, 41)
  t.end()
})

tap.test('function calls are trapped', t => {
  const o = function() { return 42 }

  const calls = []
  const spyCallback = function(source, query, getResult) {
    const result = getResult()
    calls.push({ source, query, result })
    return 41
  }

  const handler = spyPropertyReads(spyCallback)
  const spy = new Proxy(o, handler)

  t.equal(spy(), 41)
  t.equal(calls[0].source, o)
  t.equal(calls[0].query, 'apply()')
  t.equal(calls[0].result, 42)
  // => 42
  t.end()
})

tap.test('property descriptors are trapped', t => {
  const o = {
    a: 42,
    get b() { return 10 }
  }

  const calls = []
  const spyCallback = function(source, query, getResult) {
    const result = getResult()
    calls.push({ source, query, result })
    return 41
  }

  const handler = spyPropertyReads(spyCallback)
  const spy = new Proxy(o, handler)

  t.equal(Object.getOwnPropertyDescriptor(spy, 'a').value, 41)
  t.equal(calls[0].source, o)
  t.equal(calls[0].query, 'getOwnPropertyDescriptor("a").value')
  t.equal(calls[0].result, 42)

  t.equal(Object.getOwnPropertyDescriptor(spy, 'b').get(), 41)
  t.equal(calls[1].source, o)
  t.equal(calls[1].query, 'getOwnPropertyDescriptor("b").get()')
  t.equal(calls[1].result, 10)

  t.end()
})

tap.test('prototype getter is trapped', t => {
  const o = Object.create({ foo: 'bar' })

  const calls = []
  const spyCallback = function(source, query, getResult) {
    const result = getResult()
    calls.push({ source, query, result })
    return { foo: 'baz' }
  }

  const handler = spyPropertyReads(spyCallback)
  const spy = new Proxy(o, handler)

  t.equal(Object.getPrototypeOf(spy).foo, 'baz')
  t.equal(calls[0].source, o)
  t.equal(calls[0].query, 'getPrototypeOf()')
  t.equal(calls[0].result.foo, 'bar')

  t.end()
})

tap.test('composing proxy handlers', t => {
  const o = {}
  // 1 - every property return 42
  const handler1 = { get: () => 42 }

  const calls = []
  const spyCallback = function(source, query, getResult) {
    const result = getResult()
    calls.push({ source, query, result })
    return result
  }

  // 2 - spy on property reads
  const handler2 = spyPropertyReads(spyCallback, handler1)

  // 3 - add un-spyable property
  const handler3 = {
    ...handler2,
    get: function(target, prop) {
      if (prop === 'secret') { return 'foo' }
      else { return handler2.get(...arguments) }
    }
  }

  const spy = new Proxy(o, handler3)

  t.equal(spy.a, 42)
  t.equal(calls[0].source, o)
  t.equal(calls[0].query, 'get("a")')
  t.equal(calls[0].result, 42)

  t.equal(spy.b, 42)
  t.equal(calls[1].source, o)
  t.equal(calls[1].query, 'get("b")')
  t.equal(calls[1].result, 42)

  t.equal(spy.c, 42)
  t.equal(calls[2].source, o)
  t.equal(calls[2].query, 'get("c")')
  t.equal(calls[2].result, 42)

  t.equal(spy.secret, 'foo')
  t.equal(calls.length, 3)

  t.end()
})
