# Variables型定義ドキュメント

このドキュメントは、プロンプト変数の型定義について説明します。

## このドキュメントの位置づけ

このドキュメントは、[変数定義](./variables.ja.md)で説明されている変数の概念を、TypeScriptの型システムで実装するための詳細な仕様を定義しています。

`variables.ja.md`では以下の概念を説明しています：

- 変数の2つの側面（予約変数とテンプレート変数）
- 変数の命名規則と制約
- 変数の検出と置換処理の流れ

一方、このドキュメントでは：

- 変数の型システムの実装詳細
- 型のバリデーションルール
- 型の拡張方法と注意点

を説明しています。

## 基本構造

型定義は以下の階層で構成されています：

```typescript
// 1. キーの命名規則を表現する型
type ValidVariableKey = string & {
  readonly _brand: unique symbol; // 英数字とアンダースコアのみ、先頭は英字の制約
};

// 2. パス形式の値の型
type FilePath = string & {
  readonly _type: "file_path";
};

type DirectoryPath = string & {
  readonly _type: "directory_path";
};

// 3. テキスト形式の値の型
type TextContent = string & {
  readonly _type: "text_content";
};

// 4. 変数の型定義
type Variables = Partial<
  { // すべてのキーは任意
    [K in ValidVariableKey]: FilePath | DirectoryPath | TextContent;
  }
>;
```

## 型の説明

### ValidVariableKey

- 変数名（キー）の制約を表現する型
- 制約：
  - 英数字とアンダースコアのみ使用可能
  - 先頭は英字のみ
  - 大文字小文字を区別する

### 値の型

1. **FilePath**
   - ファイルパスを表現する型
   - 有効なファイルパス形式であることを保証
   - 拡張子は`.md`, `.txt`, `.yml`のみ許可

2. **DirectoryPath**
   - ディレクトリパスを表現する型
   - 有効なディレクトリパス形式であることを保証

3. **TextContent**
   - テキスト形式のコンテンツを表現する型
   - テキスト形式であることを保証
   - マークダウン形式のテキストも含む

### Variables型

- すべてのキーは任意（Partial型を使用）
- キーは`ValidVariableKey`型に準拠
- 値は`FilePath`、`DirectoryPath`、`TextContent`のいずれか

## バリデーション

```typescript
interface VariableValidator {
  validateKey(key: string): key is ValidVariableKey;
  validateFilePath(path: string): path is FilePath;
  validateDirectoryPath(path: string): path is DirectoryPath;
  validateTextContent(text: string): text is TextContent;
}
```

### バリデーションの特徴

1. 初期化時に一括検証
2. エラー処理：
   - 不正なキー検出時はデバッグログに出力
   - 実行は継続（エラーは発生させない）
   - 不正なキーは無視

## 実装例

```typescript
class VariableStore {
  private store: Map<ValidVariableKey, FilePath | DirectoryPath | TextContent>;

  constructor(variables: Variables, validator: VariableValidator) {
    this.store = new Map();
    this.initializeWithValidation(variables, validator);
  }

  get(key: ValidVariableKey): FilePath | DirectoryPath | TextContent | undefined {
    return this.store.get(key);
  }
}
```

## 型定義の利点

1. **型安全性**
   - キーの命名規則を型レベルで強制
   - 値の形式を型で保証
   - コンパイル時の型チェック

2. **柔軟性**
   - すべてのキーは任意設定可能
   - 新しい変数の追加が容易

3. **エラー処理**
   - バリデーションは初期化時に実行
   - エラーハンドリングが明確

4. **拡張性**
   - 新しい型の追加が容易
   - バリデーションルールの追加が容易

## 使用例

```typescript
// プロンプトパラメータの定義例
const params: PromptParams = {
  prompt_file_path: "/path/to/prompt.md" as FilePath,
  variables: {
    schema_file: "/path/to/schema.yml" as FilePath,
    input_text: "Sample text content" as TextContent,
    input_file: "/path/to/input.txt" as FilePath,
    destination_path: "/path/to/output/" as DirectoryPath,
  },
  validator: new CustomVariableValidator(),
};
```

## 注意事項

1. 型の拡張
   - 新しい型を追加する場合は、対応するバリデーション関数も追加する
   - 型の整合性を保つ

2. バリデーション
   - 実行時のバリデーションは必ず行う
   - 型アサーションは慎重に使用

3. エラー処理
   - テストでのデバッグログを活用
   - エラーは適切に処理し、実行を継続
