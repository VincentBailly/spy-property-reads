# Spy-property-reads

JavaScript offers various ways for an object to store another object.
This library help spy on all the ways in which other objects are extracted from a given object

## Usage

### Spy property getters

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = { a: 42, b: 42 }

const spyCallback = function(source, query, result) {
  console.log({ query, result })
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
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

// accessing 42 by calling the function
spy()
// => 42
//  console.log() => { query: 'apply()', result: 42 } 

```

### Spy on function arguments

This scenario may seem convoluted but this is what happens when
we pass a callback to a promise's ".then" method to extract the
value from the promise.

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = function(callback) { callback(42); return 'callback called' }

const spyCallback = function(source, query, result) {
  console.log({ query, result })
}

const handler = spyPropertyReads(spyCallback)
const spy = new Proxy(o, handler)

// accessing 42 through the arguments of a function
spy((arg) => { arg === 42 })
// => 'callback called'
//  console.log() => { query: 'arg1(apply(arg1(apply())))', result: 42 } 

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
