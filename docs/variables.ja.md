# 変数

変数は、2つの側面で定義される。

1. 事前定義：事前定義された変数名と、対応する型、変数を処理するクラス
2. テンプレート記法: テンプレートのスキャンで発見された変数名

上記の1は「予約変数」と定義する。
2は「テンプレート変数」と定義する。

##　予約変数
予約変数は、メインコードで定義される。
型及びクラス名の定義が必要であり、必ず事前に定義されたリストとなる。
このアプリケーションは、予約変数名と値を variables の値として受け取る。

詳細な型定義については、[型定義ドキュメント](./type_of_variables.ja.md)を参照してください。

### バリデーション

このアプリケーションへ、引数として渡すことができるのは、予約変数のみである。
予約変数以外に、引数で渡された変数は、エラーを出力する。
エラーメッセージは、別途エラー定義に従う。

## テンプレート変数

テンプレート変数は、テンプレートをスキャンするときに、`{variable}` 記法に一致したパターンから取得される。

テンプレートには、事前に予期できない名称が使われる可能性があるため、予約変数とは扱い方を分ける。

- 検出:
  - "something {variable_name} here."
  - "something{variable_name}here."
  - "something{variable_name}here."
  - "something {variable_name} here. \n{variable_name}"
- 検出しない:
  - "something { variable_name } here."
  - "something{ variable_name }here."
  - "something{ variable_name}here."
  - "something{variable_name }here."
  - "something {{variable_name}} here is not detected."
  - "something {{variable_name} here is not detected."
  - "something {variable_name}} here is not detected."
  - "something{{variable_name}}here is not detected."
  - "something{{variable_name1}, {variable_name2}}here is not detected."
  - "something {{variable name}} here is not detected."
  - "something {{variable\nname}} here is not detected."

### バリデーション

テンプレート変数に用いることができる文字列は以下のルールである。

- 英数字とアンダースコアのみ使用可能
- 先頭は英字のみ
- 大文字小文字を区別

### テンプレート変数の発見

- テンプレートを１行ずつスキャンし、変数を発見したときにトリガーを発動する。「変数発見トリガー」と定義する。発見の都度、トリガーが発動する。

「変数発見トリガー」を起点に、「テンプレート変数の置換処理」が行われる。

同じ変数名を複数回呼び出すことも可能。（複数回の呼び出しをハンドリングする必要はない）

# テンプレート変数の置換処理

「変数発見トリガー」を起点に、以下の処理が行われる。

- 発見されたテンプレート変数が、「予約変数」の名称に一致するかチェック
  - yes: 後続処理を継続
  - no : 変数処理を中断し、「処理をスキップする」よう返却する
- 「予約変数」に対応するクラスのインスタンスを生成する
  - variables で渡された引数値があれば、用いる
  - variables に渡されていない場合は、値がNullとして扱う
  - Null値をエラーとするか、空白とするかは、各クラスの定義に任せる
- インスタンスの変換処理を実行し、変換結果を取得する
  - 引数値の加工処理や、加工方法は、クラス定義に任せる
  - 変数に共通の返却型を受け取る
- 変換結果を文字列化してテンプレートへ返却する（変数の記述箇所を、返却値で置き換える）

# 予約変数とテンプレート変数の一致

最終的には予約変数と一致したテンプレート変数のみが用いられる。
その理由は、

1. 予約変数は事前定義されている。
2. テンプレート変数がトリガーされたとき、予約変数名と一致した場合のみ置換処理される。
