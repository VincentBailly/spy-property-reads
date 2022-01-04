# Spy-property-reads

JavaScript offers various ways for an object to store another object.
This library give a uniform way to trap the various ways in which properties are extracted from an object.

## Usage

### Spy property getters

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = { a: 42, b: 42 }

const spyCallback = function(source, query, result) {
  console.log({ query, result })
  return result
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

// accessing 42 using the property 'a'
spy.a
// => 42
//  console.log() => { query: 'get("a")', result: 42 } 

spy.b
// => 42
//  console.log() => { query: 'get("b")', result: 42 } 

```

### Spy functions return values


```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = function() { return 42 }

const spyCallback = function(source, query, result) {
  console.log({ query, result })
  return result
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

// accessing 42 by calling the function
spy()
// => 42
//  console.log() => { query: 'apply()', result: 42 } 

```

### Spy property descriptors

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = {
  a: 42,
  get b() { return 10 }
}

const spyCallback = function(source, query, result) {
  console.log({ query, result })
  return result
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

Object.getOwnPropertyDescriptor(spy, 'a').value
// => 42
//  console.log() => { query: 'getOwnPropertyDescriptor("a").value', result: 42 } 

Object.getOwnPropertyDescriptor(spy, 'b').get()
// => 10
//  console.log() => { query: 'getOwnPropertyDescriptor("b").get()', result: 10 } 
```

### Spy access to the prototype

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = Object.create({ foo: 'bar' })

const spyCallback = function(source, query, result) {
  console.log({ query, result })
  return result
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

Object.getPrototypeOf(spy)
// => { foo: 'bar' }
//  console.log() => { query: 'getPrototypeOf()', result: { foo: 'bar' } } 

```

### Composing proxy handlers

The proxy handlers created by 'spy-property-reads' can wrap other proxy handlers.
This allows composition of 'proxy enhancers' to create sophisticated
proxy behavior.

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = {}
// 1 - every property return 42
const handler1 = { get: () => 42 }

const spyCallback = function(source, query, result) {
  console.log({ query, result })
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

spy.a
// => 42
//  console.log() => { query: 'get("a")', result: 42 } 
spy.b
// => 42
//  console.log() => { query: 'get("b")', result: 42 } 
spy.c
// => 42
//  console.log() => { query: 'get("c")', result: 42 } 
spy.secret
// => foo
// No call to "console.log"

```
