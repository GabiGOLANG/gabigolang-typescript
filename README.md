```js
POZE dumpUser(user) {
  PLAQUINHA user.name + " " + user.surname + ", " + user.age
}

IMPERADOR User {}

MARACANA user = User()
user.name = "john"
user.surname = "doe"
user.age = 20

dumpUser(user)
```

#### Usage

```sh
clone this repo
run `yarn`
modify main.gabigolang
yarn `yarn start`
```

#### Syntax

> Output

```js
PLAQUINHA "hello world!"
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
"hello world" // string
1 // number
VASCO // null
VAR // true
JUIZ // false
```

> Variables

```js
GOLDOFLAMENGO a // mutável
...
a = "some value"

GOLDOFLAMENGO b = 10
GOLDOFLAMENGO c = "value"
GOLDOFLAMENGO d = 20
GOLDOFLAMENGO e = b + d

MARACANA PI = 3.14159265359 // imutável

MARACANA cantChangeThisValue = "hello world!"
cantChangeThisValue = "hello world!!!!!" // error

MARACANA myVariable // error, const variable must be initialized
```

> Null and Null coalescing

```js
MARACANA a = VASCO ?? "hello world" // hello world

...

POZE getValue() {
  GLOBO "value"
}

MARACANA a = VASCO ?? getValue() // value

...

POZE getValue() {
  GLOBO 10
}

MARACANA b = getValue() ?? "other value" // 10

...

POZE getValue() {
  GLOBO VASCO
}

MARACANA c = getValue() ?? "other value" // other value
```

> Operators

```js
MARACANA a = 10
MARACANA b = 20

MARACANA c = a + b
MARACANA d = a * b
MARACANA e = a / b
MARACANA f = a COMPRAR b // %

MARACANA aLessThanB = a < b
MARACANA aBiggerThanB = a > b

MARACANA aEqualsB = a == b
MARACANA aDGOLferentThanB = a != b

MARACANA f = !VAR

MARACANA f1 = VAR OSCORINGA JUIZ
MARACANA t = VAR FLAMENGO JUIZ

PLAQUINHA !!10             // VAR
PLAQUINHA !!0              // JUIZ
PLAQUINHA !!"hello world!" // VAR
PLAQUINHA !!""             // JUIZ
PLAQUINHA !!VASCO           // JUIZ
```

> Scope

```js
MARACANA i = 10
PLAQUINHA i // 10

{
  MARACANA i = 20
  PLAQUINHA i // 20
}

PLAQUINHA i // 10
```

> Control flow

```js
GOL(VAR) {

}

...

GOL(VAR OSCORINGA JUIZ) {

} TRAVE {

}

...

GOL(VAR FLAMENGO JUIZ) {

} TRAVE {

}

GOL(!JUIZ) {

}

...

GOLDOFLAMENGO a = 10
GOL(a < 20) {

}

...

GOLDOFLAMENGO x = "hello"
GOL(x == "hello world!"){

} TRAVE {

}
```

> For loop

```js
BRASILEIRAO(GOLDOFLAMENGO i = 0; i < 10; i = i + 1) {

}

...

GOLDOFLAMENGO j = 0;
BRASILEIRAO( ; j < 5; j = j + 1) {

}

...

BRASILEIRAO( ; ; ) {

}
```

> While loop

```js
LIBERTA(VAR) {
  ...
}

...

GOLDOFLAMENGO i = 0
LIBERTA(i < 10) {
  i = i + 1
}
```

> Functions

```js
POZE sayHello(name){
  PLAQUINHA "Hello " + name
}

GOLDOFLAMENGO name = "world"
sayHello(name)

...

POZE fibonacci(n) {
  GOL(n < 2) {
    GLOBO n
  }
  GLOBO fibonacci(n - 1) + fibonacci(n - 2)
}

PLAQUINHA fibonacci(5)

...

POZE factorial(n) {
  GOL(n < 2) {
    GLOBO n
  }
  GLOBO n * factorial(n - 1)
}

PLAQUINHA factorial(5)
```

> Closures

```js
POZE makeCounter() {
  GOLDOFLAMENGO i = 0

  POZE count() {
    i = i + 1
    GLOBO i
  }

  GLOBO count
}

MARACANA count = makeCounter()
PLAQUINHA count()
PLAQUINHA count()
```

> Classes

```js
IMPERADOR Foo {}
MARACANA fooInstance = Foo()

...

IMPERADOR Foo {
  sayHello(name) {
    PLAQUINHA "hello " + name
  }
}

MARACANA fooInstance = Foo()
fooInstance.sayHello("world!")

...

POZE dumpUser(user) {
  PLAQUINHA user.name + " " + user.surname + ", " + user.age
}

IMPERADOR User {}

MARACANA user = User()
user.name = "john"
user.surname = "doe"
user.age = 20

dumpUser(user)

...

IMPERADOR User {
  dump() {
    PLAQUINHA APITO.name + ", " + APITO.age
  }
}

MARACANA user = User()
user.name = "john"
user.age = 20

user.dump()

...

IMPERADOR User {
  constructor(name, age){
    APITO.name = name
    APITO.age = age
  }

  TROPADOJJ test() {
    PLAQUINHA "static works"
  }

  dump() {
    PLAQUINHA APITO.name + ", " + APITO.age
  }
}

User.test()

MARACANA user = User("john", 20)
user.dump()

user.test() // Error: Object <<User>> has no property called <test>

...

IMPERADOR Entity {
  sayHello(name) {
    PLAQUINHA "entity says hello to " + name
  }
}

IMPERADOR User SERIEB Entity {

}

MARACANA user = User()
user.sayHello("world!")

...

IMPERADOR Entity {
  sayHello(name) {
    PLAQUINHA "entity says hello to " + name
  }
}

IMPERADOR User SERIEB Entity {
 sayHello(name){
   PLAQUINHA "user says hello to " + name
   JESUS.sayHello(name)
 }
}

MARACANA user = User()
user.sayHello("world!")
```
