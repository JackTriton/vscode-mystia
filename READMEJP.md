# Mystia 拡張機能 for Visual Studio Code

[Visual Studio Code](https://code.visualstudio.com/) 用の [拡張機能](https://marketplace.visualstudio.com/VSCode) で、[Mystia 言語](https://github.com/KajizukaTaichi/mystia) を強力にサポートします。これにより、デバッグ、フォーマット、コードナビゲーション、変数エクスプローラー、テストエクスプローラーなどをシームレスに統合して提供できます。

## クイックスタート

* **Step.1**: リリースから `.vsix` をインストールします

* **Step.2**: 拡張機能ビューから `...` を押し、`VSIX からインストール...` を選択します

* **Step.3**: ダウンロードしたファイルを選択し、ウィンドウをリロードします

* **Step.4**: `F5` または `fn + F5` を押して `Mystia: Setup Environment` を選択します

## デバッグ / コンパイル / REPL / サマリー

**Debug**: Mystia ファイルを実行します

**Compile**: Mystia ファイルを `wasm` と `wat` ファイルに変換します

**REPL**: ターミナルに REPL ウィンドウを表示します

**Summery**: Mystia ファイルで使用されたすべての引数を表示します

---

# Mystia 言語仕様

---

## 1. ファイル拡張子

* ソースファイルの拡張子は `.ms` を使用します。

## 2. 字句構造

* **識別子**: `[A-Za-z_][A-Za-z0-9_]*`
* **キーワード**: `let, type, load, if, then, else, while, loop, return, break, next`
* **リテラル**:

  * **整数**: `[0-9]+`
  * **浮動小数点**: `[0-9]+\.[0-9]+`
  * **ブール**: `true, false`
  * **文字列**: `"(\\.|[^"])*"`
* **演算子**: `+, -, *, /, %, ==, !=, <, <=, >, >=, &&, ||, !, as`
* **区切り文字**: `(`, `)`, `{`, `}`, `[`, `]`, `,`, `:`, `;`, `.`
* **コメント**:

  * ブロックコメント: `~~ ... ~~`

## 3. 型

* **プリミティブ型**: `int, num, bool, str, void`

* **関数型**: `(arg1: Type1, arg2: Type2, ...) : ReturnType`

* **配列**: 同じ型の要素のコレクション。可変長配列は `Type[]`、固定長配列は `[Type; length]` を使用します。

* **列挙型 (Enum)**: 名前付き定数バリアントの集合を列挙する。サムタイプに類似します。

  ```ms
  type Direction = ( North | South | East | West );
  ```

* **バリアント (Sum type)**: タグ付きユニオンを表現するために型パラメータ付きのバリアントを定義します。

  ```ms
  type Result<T, E> = ( Ok(T) | Err(E) );
  ```

* **ユーザー定義型**: `type Name = ...` 宣言で定義される任意の型。

## 4. 宣言

### 4.1. let バインディング

```ms
let x = 42;
let pi = 3.14;
let name = "Alice";
```

* 構文: `let <identifier> = <expression>;`
* バインディングは不変です。

> **ループ内でのインクリメント省略記法:**
>
> ```ms
> while i < 10 loop {
>   i.fizzbuzz().print();
>   let i + 1    // 1を加算
>   let i - 1    // 1を減算
>   let i * 2    // 2倍
>   let i / 2    // 半分
>   let i % 3    // 3で割った余り
> }
> ```
>
> `let <variable> <op> <expr>` は `<variable> = <variable> <op> <expr>;` の省略形で、`<op>` は `+, -, *, /, %` のいずれかです。

### 4.2. 型定義 (Type Definitions)

```ms
type Result<T, E> = ( Ok(T) | Err(E) );
```

* 構文: `type <Name><Generics>? = ( Variant1 | Variant2 | ... );`

## 5. 式

* **算術演算**: `+, -, *, /, %`
* **ブール演算**: `&&, ||, !`
* **比較演算**: `==, !=, <, <=, >, >=`
* **関数呼び出し**: `f(a, b, c)`
* **メソッド呼び出し**: `obj.method(args)`
* **型キャスト**: `<expr> as <Type>`
* **ブロック**: `{ <stmt>* <expr>? }`

## 6. 制御フロー

### 6.1. if 式

```ms
let sign = if x > 0 then "+" else "-";
```

* 構文: `if <cond> then <expr> else <expr>`

### 6.2. while ループ

```ms
while i < 10 loop {
  i = i + 1;
}
```

* 構文: `while <cond> loop { <stmt>* }`

### 6.3. Return / ループ制御

* `return <expr>?;`
* `break;`, `next;`

## 7. モジュールインポート構文

Mystia は JavaScript などの外部モジュールから関数をインポートできます。

```ms
// 標準ライブラリから単一関数をインポート:
load print(msg: str): void;

// 別モジュールから複数の関数をエイリアス付きでインポート:
load MathLib::{ floor(n: num): int as fl, sin(x: num): num };
```

* `load` キーワード
* 単一インポートまたはブロックインポート
* `<ModuleName>::...` 構文
* オプションで `as <alias>` を使用可能

## 8. JavaScript との相互運用

* インポートはランタイムローダー (run.mjs / repl.mjs) を介して Web API や Node.js モジュールとマッピングされます。
* `load` 宣言を使って JS の関数を Mystia に取り込みます。

## 9. 標準ライブラリの規約

* 組み込みの `MathLib` には `pi()`, `floor()`, `sin()`, `cos()` などが含まれています。
* `OSLib` には `getcwd()`, `mkdir(path: str)` などの関数が用意されている場合があります。

## 10. サンプルコード

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
