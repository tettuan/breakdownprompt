# パス検証ルール

## 概要

このドキュメントでは、プロンプト管理システムにおけるパス検証ルールとエラーメッセージについて説明します。これらのルールにより、アプリケーション全体で安全かつ一貫したファイルパスとディレクトリパスの取り扱いを確保します。

推奨されているPATHは、プロジェクトの相対パス配下で全てを構成することです。

## 許可される絶対パス

以下の絶対パスは、セキュリティ上の理由から特別に許可されています：

1. **一時ディレクトリ**
   - `Deno.makeTempDir()` で作成されるディレクトリ
   - 一時ディレクトリの検出に失敗した場合のフォールバックパス：
     - `/tmp`
     - `/var/tmp`
     - `/private/var/folders`
     - `/var/folders`

2. **カレントディレクトリ以下のパス**
   - プロジェクトルートからの相対パス
   - 実行時のカレントディレクトリからの相対パス

3. **システム一時ディレクトリ**
   - 一時ファイルの作成に使用されるシステムディレクトリ
   - 動的に検出され、存在が確認された場合のみ許可

## パス検証ルール

### 基本ルール

1. **空のパス**
   - 空のパスは許可されない
   - エラーメッセージ: `"パスが空です"`

2. **使用可能な文字**
   - 許可される文字:
     - 英数字 (`a-zA-Z0-9`)
     - スラッシュ (`/`)
     - ハイフン (`-`)
     - アンダースコア (`_`)
     - ドット (`.`)
   - エラーメッセージ: `"無効なパス: 使用できない文字が含まれています"`

3. **パストラバーサル防止**
   - ディレクトリトラバーサル (`..`) は許可されない
   - エラーメッセージ: `"無効なパス: ディレクトリトラバーサルが含まれています"`

4. **パス形式**
   - 相対パスは常に許可される
     - `./` で始まるパス (例: `./test.txt`)
     - `./` なしの相対パス (例: `test.txt`, `path/to/file.txt`)
   - 絶対パス（`/`で始まる）は基本的に許可されない
   - 例外:
     - カレントディレクトリ以下のパスは許可
     - システムの一時ディレクトリは動的に検出され許可される
       - `Deno.makeTempDir()` で作成されるディレクトリの親ディレクトリ
       - 検出に失敗した場合は以下のディレクトリがフォールバックとして使用される:
         - `/tmp`
         - `/var/tmp`
         - `/private/var/folders`
         - `/var/folders`
   - エラーメッセージ: `"無効なパス: 絶対パスは許可されていません"`

### ファイルパス固有のルール

1. **ファイルの存在確認**
   - パスは既存のファイルを指している必要がある
   - エラーメッセージ: `"ファイルが存在しません: {path}"`

2. **ファイルのアクセス権限**
   - ファイルは読み取り可能である必要がある
   - エラーメッセージ: `"ファイルを読み取ることができません: {path}"`

### ディレクトリパス固有のルール

1. **ディレクトリの存在確認**
   - パスは既存のディレクトリを指している必要がある
   - エラーメッセージ: `"ディレクトリが存在しません: {path}"`

2. **ディレクトリのアクセス権限**
   - ディレクトリは書き込み可能である必要がある
   - エラーメッセージ: `"ディレクトリに書き込むことができません: {path}"`

## 例

### 有効なパス

```typescript
// ファイルパス
"test.md";
"test.txt";
"test.yml";
"path/to/file.md";
"./file.txt";
"/tmp/test/file.yml";

// ディレクトリパス
"test_dir";
"path/to/dir";
"./dir";
"/tmp/test/dir";
```

### 無効なパス

```typescript
// ファイルパス
""; // 空のパス
"../file.md"; // ディレクトリトラバーサル
"/absolute/path.txt"; // 絶対パス
"path with spaces.md"; // スペースを含む
"file@name.yml"; // 特殊文字を含む

// ディレクトリパス
""; // 空のパス
"../dir"; // ディレクトリトラバーサル
"/absolute/dir"; // 絶対パス
"dir with spaces"; // スペースを含む
"dir@name"; // 特殊文字を含む
```

## 実装の詳細

パス検証は以下のクラスを通じて実装されます：

1. `PathValidator` - コアとなるパス検証ロジック
2. `VariableValidator` - 変数固有のパス検証
3. `TemplateFile` - テンプレートファイルのパス検証

### 使用例

```typescript
import { PathValidator } from "@tettuan/breakdownprompt/validation";

const validator = new PathValidator();

// ファイルパスの検証
const isValidFile = validator.validateFilePath("test.md");

// ディレクトリパスの検証
const isValidDir = validator.validateDirectoryPath("test_dir");
```

## エラーハンドリング

すべてのパス検証エラーは、`ValidationError`としてスローされ、説明的なメッセージが含まれます。エラーメッセージは明確で対処可能な内容となっており、ユーザーがパスが拒否された理由と修正方法を理解できるようになっています。

### 一般的なエラーシナリオ

1. **無効な文字**
   ```typescript
   try {
     validator.validateFilePath("file@name.md");
   } catch (error) {
     // error.message: "無効なパス: 使用できない文字が含まれています"
   }
   ```

2. **ディレクトリトラバーサル**
   ```typescript
   try {
     validator.validateFilePath("../file.txt");
   } catch (error) {
     // error.message: "無効なパス: ディレクトリトラバーサルが含まれています"
   }
   ```

3. **絶対パス**
   ```typescript
   try {
     validator.validateFilePath("/etc/passwd");
   } catch (error) {
     // error.message: "無効なパス: 絶対パスは許可されていません"
   }
   ```

## セキュリティ考慮事項

1. **パストラバーサル防止**
   - パスコンポーネントの厳密な検証
   - `..`を含むパスの拒否
   - 検証前のパスの正規化

2. **ファイルシステムアクセス**
   - ファイルの存在と権限の検証
   - システムディレクトリへのアクセス防止
   - 絶対パスの制限

3. **入力検証**
   - 厳密な文字セット検証
   - 長さの検証
   - 型チェック
