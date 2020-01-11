### Toy language

#### The whole code is pretty much based on this book https://craftinginterpreters.com/

```js
function dumpUser(user) {
  print user.name + " " + user.surname + ", " + user.age;
}

class User {}

const user = User();
user.name = "john";
user.surname = "doe";
user.age = 20;

dumpUser(user);
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

> Values

```js
"hello world"; // string
1; // number
null; // null
true; // boolean
false; // boolean
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

...

function getValue() {
  return "value";
}

const a = null ?? getValue(); // value

...

function getValue() {
  return 10;
}

const b = getValue() ?? "other value"; // 10;

...

function getValue() {
  return null;
}

const c = getValue() ?? "other value"; // other value
```

> Operators

```js
const a = 10;
const b = 20;

const c = a + b;
const d = a * b;
const e = a / b;
const f = a mod b;

const aLessThanB = a < b;
const aBiggerThanB = a > b;

const aEqualsB = a == b;
const aDifferentThanB = a != b;

const f = !true;

const f1 = true and false;
const t = true or false;

print !!10;             // true
print !!0;              // false
print !!"hello world!"; // true
print !!"";             // false
print !!null;           // false
```

> Scope

```js
const i = 10;
print i; // 10;

{
  const i = 20;
  print i; // 20;
}

print i; // 10;
```

> Control flow

```js
if(true) {

}

...

if(true and false) {

} else {

}

...

if(true or false) {

} else {

}

if(!false) {

}

...

let a = 10;
if(a < 20) {

}

...

let x = "hello";
if(x == "hello world!"){

} else {

}
```

> For loop

```js
for(let i = 0; i < 10; i = i + 1) {

}

...

let j = 0;
for( ; j < 5; j = j + 1) {

}

...

for( ; ; ) {

}
```

> While loop

```js
while(true) {
  ...
}

...

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

...

function fibonacci(n) {
  if(n < 2) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
}

print fibonacci(5);

...

function factorial(n) {
  if(n < 2) {
    return n;
  }
  return n * factorial(n - 1);
}

print factorial(5);
```

> Closures

```js
function makeCounter() {
  let i = 0;

  function count() {
    i = i + 1;
    return i;
  }

  return count;
}

const count = makeCounter();
print count();
print count();
```

> Classes

```js
class Foo {}
const fooInstance = Foo();

...

class Foo {
  sayHello(name) {
    print "hello " + name;
  }
}

const fooInstance = Foo();
fooInstance.sayHello("world!");

...

function dumpUser(user) {
  print user.name + " " + user.surname + ", " + user.age;
}

class User {}

const user = User();
user.name = "john";
user.surname = "doe";
user.age = 20;

dumpUser(user);

...

class User {
  dump() {
    print this.name + ", " + this.age;
  }
}

const user = User();
user.name = "john";
user.age = 20;

user.dump();

...

class User {
  constructor(name, age){
    this.name = name;
    this.age = age;
  }

  static test() {
    print "static works";
  }

  dump() {
    print this.name + ", " + this.age;
  }
}

User.test();

const user = User("john", 20);
user.dump();

user.test() // Error: Object <<User>> has no property called <test>
```
