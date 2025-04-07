# Variables型定義ドキュメント

このドキュメントは、プロンプト変数の型定義について説明します。

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

// 3. マークダウン形式の値の型
type MarkdownText = string & {
  readonly _type: "markdown_text";
};

// 4. 変数の型定義
type Variables = Partial<
  { // すべてのキーは任意
    [K in ValidVariableKey]: FilePath | DirectoryPath | MarkdownText;
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

2. **DirectoryPath**
   - ディレクトリパスを表現する型
   - 有効なディレクトリパス形式であることを保証

3. **MarkdownText**
   - マークダウン形式のテキストを表現する型
   - マークダウン形式であることを保証

### Variables型

- すべてのキーは任意（Partial型を使用）
- キーは`ValidVariableKey`型に準拠
- 値は`FilePath`、`DirectoryPath`、`MarkdownText`のいずれか

## バリデーション

```typescript
interface VariableValidator {
  validateKey(key: string): key is ValidVariableKey;
  validateFilePath(path: string): path is FilePath;
  validateDirectoryPath(path: string): path is DirectoryPath;
  validateMarkdownText(text: string): text is MarkdownText;
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
  private store: Map<ValidVariableKey, FilePath | DirectoryPath | MarkdownText>;

  constructor(variables: Variables, validator: VariableValidator) {
    this.store = new Map();
    this.initializeWithValidation(variables, validator);
  }

  get(key: ValidVariableKey): FilePath | DirectoryPath | MarkdownText | undefined {
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
    schema_file: "/path/to/schema.json" as FilePath,
    input_markdown: "# Title\nContent" as MarkdownText,
    input_markdown_file: "/path/to/input.md" as FilePath,
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
   - デバッグログを活用
   - エラーは適切に処理し、実行を継続
