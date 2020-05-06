# Mapject
> Get the performance of a Map with the syntax of an object.

![CI status](https://github.com/joshwilsonvu/mapject/workflows/CI/badge.svg)

## Why?
Objects in JavaScript use a natural syntax for key-value storage, but
unlike Maps, they aren't optimized for large or dynamic collections.
See other differences [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

Often, objects are a good fit for simple key-value applications, but
need to be refactored to Maps later. But refactoring objects to Maps
can be a headache, especially when using a type system. For example,
this refactor changes every single line and changes the object's type:

```diff
- let obj: Record<string, number> = {
-   asdf: 1234,
-   ghjk: 5678,
- };
- obj.zxcv = 890;
- delete obj.ghjk;
+ let obj: Map<string, number> = new Map([
+   ["asdf", 1234],
+   ["ghjk", 5678],
+ ]);
+ obj.set("zxcv", 890);
+ obj.delete("ghjk");
```

`Mapject` lets you do the same refactor with this:

```diff
- let obj: Record<string, number> = {
+ let obj: Record<string, number> = Mapject({
    asdf: 1234,
    ghjk: 5678,
- };
+ });
  obj.zxcv = 890;
  delete obj.ghjk;
```

## Install
```sh
$ npm install mapject
$ yarn add mapject
```

## Usage

Use a Mapject exactly like you would use an object.
```typescript
// Create a Mapject
let mj = Mapject();

// Create a Mapject with an underlying Map
// - mj proxies the passed map, so the map will reflect all changes
let mj = Mapject(new Map([["asdf", 1234]]));

// Create a Mapject with initial values from an object
// - the object will not reflect changes
let mj = Mapject({ asdf: 1234, ghjk: 5678 });

// Getting and setting
mj.asdf = 1234;
console.log(mj.asdf); // 1234

// Checking if Mapject has key
("asdf" in mj) // true

// Object.* methods
Object.defineProperty(mj, "asdf", { value: 1234 });

// Copy to plain object
const obj = {...mj};

// Iterate over [key, value] pairs
for (let [key, value] of mj) { ... }
let keyValuePairs = [...mj];

// Get number of keys in the mapject
Mapject.size(mj);

// Get the underlying map
Mapject.getMap(mj); // Map
```

## Notes
Similar to `Object.create(null)`, a Mapject instance doesn't
inherit methods from `Object.prototype`. No special meaning
is given to properties like `"prototype"`, `"constructor"`,
`"__proto__"`, or `"hasOwnProperty"`, so there is no danger
to setting user-supplied properties on a Mapject.

```javascript
(mj.__proto__) // undefined
mj.__proto__ = "anything";
```

To use methods from `Object.prototype`, use `Function#call`:

```javascript
Object.prototype.hasOwnProperty.call(mj, "asdf");
```

Mapject requires ES6 `Proxy` to work.