### Toy language

#### The whole code is pretty much based on this book https://craftinginterpreters.com/

```js
function fibonacci(n) {
  if(n < 2) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if(n < 2) {
    return n;
  }
  return n * factorial(n - 1);
}

print fibonacci(5);
print factorial(5);
```

#### Usage

```sh
clone this repo
run `yarn`
modify main.yajs
yarn `yarn start`
```

#### Syntax

> Output

```js
print "hello world!";
```

> Comments

```js
// This is a single line comment

/* 
  this 
  is
  a
  block
  comment
*/
```

> Variables

```js
let a;
...
a = "some value";

let b = 10;
let c = "value";
let d = 20;
let e = b + d;

const PI = 3.14159265359;

const cantChangeThisValue = "hello world!";
cantChangeThisValue = "hello world!!!!!"; // error

const myVariable; // error, const variable must be initialized
```

> Null and Null coalescing

```js
const a = null ?? "hello world"; // hello world
//
//
function getValue() {
  return "value";
}

const a = null ?? getValue(); // value
//
//
function getValue() {
  return 10;
}

const b = getValue() ?? "other value"; // 10;
//
//
function getValue() {
  return null;
}

const c = getValue() ?? "other value"; // other value
```

> Operators

```js
let a = 10;
let b = 20;

let c = a + b;
let d = a * b;
let e = a / b;
let f = a mod b;

let aLessThanB = a < b;
let aBiggerThanB = a > b;

let aEqualsB = a == b;
let aDifferentThanB = a != b;

let f = !true;

let f1 = true and false;
let t = true or false;
```

> Scope

```js
let i = 10;
print i; // 10;

{
  let i = 20;
  print i; // 20;
}

print i; // 10;
```

> Control flow

```js
if(true) {
  ...
}

if(true and false) {
  ...
} else {

}

if(true or false) {
  ...
} else {

}

if(!false) {
  ...
}

let a = 10;
if(a < 20) {
  ...
}

let x = "hello";
if(x == "hello world!"){
  ...
} else {
  ...
}
```

> For loop

```js
for(let i = 0; i < 10; i = i + 1) {
  ...
}

let j = 0;
for( ; j < 5; j = j + 1) {
  ...
}

for( ; ; ) {
  ...
}
```

> While loop

```js
while(true) {
  ...
}

let i = 0;
while(i < 10) {
  i = i + 1;
}
```

> Functions

```js
function sayHello(name){
  print "Hello " + name;
}

let name = "world";
sayHello(name);

function fibonacci(n) {
  if(n < 2) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

function factorial(n) {
  if(n < 2) {
    return n;
  }
  return n * factorial(n - 1);
}

print fibonacci(5);
print factorial(5);
```
