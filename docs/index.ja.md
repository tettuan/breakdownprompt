# ライブラリ概要
渡された引数やオプションから、どのプロンプトを用いるか判別する。
プロンプトを読み込み、プロンプト内の変数（ルール化された文字列）を、受け取ったパラメータ値で置き換える。一部の変数の値は、パラメータ値をもとに動的に生成され組み立てられる。

# 受け取りパラメータ一覧
- base_dir
- DemonstrativeType
- LayerType
- fromLayerType
- Destination　保存先
- MultipleFiles 複数ファイルか、単独か
- Structured or Independent 階層か、独立

# プロンプトファイルの特定
以下の受け取りパラメータを組み合わせて、特定する。

- base_dir
- DemonstrativeType
- LayerType
- fromLayerType

## ファイル名の組み立て
- dir : <base_dir>/<DemonstrativeType>/<LayerType>
- filename : f_<from_layer_type>.md

## 宣言とパラメータ
初期化時に base_dir が指定される。
プロンプト呼び出し時に、DemonstrativeType, LayerType, fromLayerType が指定される。


# プロンプトの読み込みと、パラメータ値の置換

## 出力形式
すべての出力において、プロンプトの内容を表示します。
表示時に「置換処理」を行ったうえで出力します。

ex.：
入力プロンプトの内容： ```prompt
# example prompt 
this is a propmt contents.
{input_markdown_file}
{input_markdown}

# schema
{schema_file}

# destination path
{destination_path}
```

出力： ```
# example prompt 
this is a propmt contents.
./.agent/breakdown/issues/12345_something.md
# input markdown
this is a input markdown contents.

# schema
./rules/schema/task/base.schema.json

# destination path
./.agent/breakdown/tasks/
```

## 置換処理
置換処理は、1つの変数名に1つのクラスを割り当てる。
クラスは、置き換える処理のルールを定義している。

流れとしては、
1. プロンプトファイルをスキャンし、変数が見つかったらクラスを宣言する。
2. クラスが必要とするパラメータをインスタンスへ渡す。どのような値を生成するか各クラスへ委譲する。
3. 各クラスは生成後の値を返す。


### 置換処理の対象変数
- schema_file
- input_markdown
- input_markdown_file
- destination_path

# 出力方法の特定
- Destination　保存先
- MultipleFiles 複数ファイルか、単独か
- Structured or Independent 階層か、独立

# エラーハンドリング
- 置換対象の変数はあらかじめ指定されている
  - 指定以外の変数が見つかった場合は、 log debug レベルで出力する
  - 例外は発生させずスルーする

# テスト
docs/tests.ja.md を参照する


