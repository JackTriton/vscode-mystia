# Mystia extension for Visual Studio Code

A [Visual Studio Code](https://code.visualstudio.com/) [extension](https://marketplace.visualstudio.com/VSCode) with rich support for the [Mystia language](https://github.com/KajizukaTaichi/mystia), providing access points for extensions to seamlessly integrate and offer support for debugging, formatting, code navigation, variable explorer, test explorer, and more!

## Quick start

-   **Step.1**:  Make sure you have Node.js installed. Then type and run following code on VScode TERMINAL:  
`npm install -g @vscode/vsce`

-   **Step.2**:  Type and run following:  
 `npm add my-org/my-repo#my-branch`

-   **Step.3**:  Press F5 (or fn+F5) and select  
 `Mystia: Setup Environment`

## Debug / Compile / REPL / Summery
**Debug** executes Mystia file

**Compile** makes Mystia file into wasm and wat file

**REPL** shows REPL window on TERMINAL

**Summery** shows all arguments used in the Mystia file

---

# Mystia Language Specification
---

## 1. File Extension

* Source files use the `.ms` extension.

## 2. Lexical Structure

* **Identifiers**: `[A-Za-z_][A-Za-z0-9_]*`
* **Keywords**: `let`, `type`, `load`, `if`, `then`, `else`, `while`, `loop`, `return`, `break`, `next`.
* **Literals**:

  * **Integers**: `[0-9]+`
  * **Floats**: `[0-9]+\.[0-9]+`
  * **Booleans**: `true`, `false`
  * **Strings**: `"(\\.|[^"])*"`
* **Operators**: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `<`, `<=`, `>`, `>=`, `&&`, `||`, `!`, `as`
* **Delimiters**: `(`, `)`, `{`, `}`, `[`, `]`, `,`, `:`, `;`, `.`
* **Comments**:

  * Block comments: `~~ ... ~~`

## 3. Types

* **Primitive**: `int`, `num`, `bool`, `str`, `void`
* **Function**: `(arg1: Type1, arg2: Type2, ...) : ReturnType`
* **Array**: A collection of elements of the same type. Use `Type[]` for variable-length arrays and `[Type; length]` for fixed-size arrays.
* **Enum**: Enumerates a set of named constant variants, similar to sum types.

  ```ms
  type Direction = ( North | South | East | West );
  ```
* **Variant (Sum type)** :Defines variants with type parameters to represent tagged unions.

  ```ms
  type Result<T, E> = ( Ok(T) | Err(E) );
  ```
* **User-defined**: Any `type Name = ...` declaration.

## 4. Declarations

### 4.1. Let Bindings

```ms
let x = 42;
let pi = 3.14;
let name = "Alice";
```

* Syntax: `let <identifier> = <expression>;`
* Bindings are immutable.

> **Increment shorthand in loops:**
>
> ```ms
> while i < 10 loop {
>   i.fizzbuzz().print();
>   let i + 1    // adds 1
>   let i - 1    // subtracts 1
>   let i * 2    // multiplies by 2
>   let i / 2    // divides by 2
>   let i % 3    // remainder of division by 3
> }
> ```
>
> `let <variable> <op> <expr>` acts as shorthand for `<variable> = <variable> <op> <expr>;`, where `<op>` can be `+`, `-`, `*`, `/`, or `%`.

### 4.2. Type Definitions

```ms
type Result<T, E> = ( Ok(T) | Err(E) );
```

* Syntax: `type <Name><Generics>? = ( Variant1 | Variant2 | ... );`

## 5. Expressions

* **Arithmetic**: `+, -, *, /, %`
* **Boolean**: `&&, ||, !`
* **Comparison**: `==, !=, <, <=, >, >=`
* **Function call**: `f(a, b, c)`
* **Method call**: `obj.method(args)`
* **Type cast**: `<expr> as <Type>`
* **Block**: `{ <stmt>* <expr>? }`

## 6. Control Flow

### 6.1. If Expression

```ms
let sign = if x > 0 then "+" else "-";
```

* Syntax: `if <cond> then <expr> else <expr>`

### 6.2. While Loop

```ms
while i < 10 loop {
  i = i + 1;
}
```

* Syntax: `while <cond> loop { <stmt>* }`

### 6.3. Return / Loop Control

* `return <expr>?;`
* `break;`, `next;`

## 7. Module Import Syntax

Mystia supports importing external functions from JavaScript or other modules.

```ms
// Import a single function from standard library:
load print(msg: str): void;

// Import multiple functions from other module with alias:
load MathLib::{ floor(n: num): int as fl, sin(x: num): num };

```

* `load` keyword
* Single or block import patterns
* `<ModuleName>::module`
* Optional `as <alias>`

## 8. Interop with JavaScript

* Imports map to Web API or Node.js modules via the runtime loader (in `run.mjs` / `repl.mjs`).
* Use `load` declarations to bring JS functions into Mystia.

## 9. Standard Library Conventions

* A built‑in `MathLib` provides `pi()`, `floor()`, `sin()`, `cos()`, etc.
* An `OSLib` may provide `getcwd()`, `mkdir(path: str)`, and related functions.

## 10. Example Snippet

```ms
load print(msg: str): void;
load to_str(n: num): str;

let fizzbuzz = fn(n: int) => {
  if n % 15 == 0 then "FizzBuzz"
  else if n % 3 == 0 then "Fizz"
  else if n % 5 == 0 then "Buzz"
  else to_str(n)
};

let i = 1;
while i <= 100 loop {
  print(fizzbuzz(i));
  let i + 1;
}
```
