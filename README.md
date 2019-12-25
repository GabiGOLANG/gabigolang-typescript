#### Toy language

### The whole code is pretty much based on this book https://craftinginterpreters.com/

```js
function sayHello(name){
  print "Hello " + name;
}

let name = "world";
sayHello(name);
```

### Usage

```sh
clone this repo
run `yarn`
yarn `yarn start`
```

### Syntax

> Output

```js
print "hello world!";
```

> Comments

```js
// This is a comment
```

> Variables

```js
let a;
let b = 10;
let c = "value";
let d = 20;
let e = b + d;
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

let false = !true;
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
```
