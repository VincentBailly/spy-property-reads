const { spyPropertyReads } = require('..')
const tap = require('tap')

tap.test('getters are trapped', t => {
  const o = { a: 42, b: 41 }

  const calls = []
  const spyCallback = function(source, query, result) {
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
  const spyCallback = function(source, query, result) {
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
  const spyCallback = function(source, query, result) {
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
