# Spy-property-reads

JavaScript offers various ways for an object to store another object.
This library help spy on an object and records all the ways in which other objects are extracted from it.

## Usage

### Spy property getters

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = { a: 42, b: 42 }

const handler = spyPropertyReads()
const spy = new Proxy(o, handler)

// accessing 42 using the property 'a'
spy.a
// => 42

reads.get(42)
// => ['get("a")']

spy.b
// 42

// Reads can be accessed with the __reads property
spy.__reads
// => [{ address: '.get("a")', value: 42 }, { address: '.get("b")', value: 42 }]

```

### Spy functions return values


```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = function() { return 42 }

const handler = spyPropertyReads()
const spy = new Proxy(o, handler)

// accessing 42 by calling the function
spy()
// => 42

spy.__reads
// => [{ address: '.apply()', value: 42 }]

```

### Spy on function arguments

This scenario may seem convoluted but this is what happens when
we pass a callback to a promise's ".then" method to extract the
value from the promise.

```javascript

const { spyPropertyReads } = require('spy-property-reads')

const o = function(callback) { callback(42) }

const handler = spyPropertyReads()
const spy = new Proxy(o, handler)

// accessing 42 through the arguments of a function
spy((arg) => { arg === 42 })

spy.__reads
// => [{ address: 'arg1(apply(arg1(.apply())))', value: 42 }]
// This means 'the first argument which is passed to the function
// which is passed as the first arg of the spied object.

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

// 2 - spy on property reads
const handler2 = spyPropertyReads(handler1)

// 3 - add un-spyable property
const handler3 = {
  ...handler2,
  get: function(target, prop) {
    if (prop === 'secret') { return 'foo' }
    else { return handler2.get(...arguments) }
  }
}

// 4 - format reads
const handler4 = {
  ...handler3,
  get: function(target, prop) {
    if (prop === '__reads') { return handler3.get(...arguments).map(({address, value}) => `${address} : ${value}`) }
    else { return handler3.get(...arguments) }
  }

const spy = new Proxy(o, handler4)

spy.a
// => 42
spy.b
// => 42
spy.c
// => 42
spy.secret
// => foo

spy.__reads
// => ['.get("a") : 42', '.get("b") : 42', '.get("c") : 42']

```
