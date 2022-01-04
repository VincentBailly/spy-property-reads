const { spyPropertyReads } = require('..')
const tap = require('tap')

tap.test('getters are trapped', t => {
  const o = { a: 42, b: 41 }

  const calls = []
  const spyCallback = function(source, query, result) {
    calls.push({ query, result })
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
  t.equal(calls[0].query, 'get("a")')
  t.equal(calls[0].result, 42)

  t.equal(spy.b, 21, 'property getter work')
  t.equal(calls[1].query, 'get("b")')
  t.equal(calls[1].result, 41)
  t.end()
})