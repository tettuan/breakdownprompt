# 返却仕様の検討

## ライブラリの目的

テンプレートの変数置換に特化したライブラリとして、以下の点に注力する：
- テンプレートの変数検出と置換
- 置換結果の正確な報告
- テンプレート内容の保持

## 返却仕様

```typescript
interface PromptResult {
  // テンプレートの処理結果
  success: boolean;
  // エラーメッセージ（失敗時のみ）
  error?: string;
  
  // テンプレート情報
  templatePath: string;  // テンプレートファイルのパス
  content?: string;     // 置換後のテンプレート（成功時のみ存在）
  
  // 変数置換の統計情報
  variables: {
    detected: string[];  // 検出された変数名
    replaced: string[];  // 置換された変数名
    remaining: string[]; // 置換されずに残った変数名
  };
}
```

## 処理結果の分類

1. 完全成功（success: true）
   - 全ての検出された変数が置換された
   - variables.detected.length === variables.replaced.length
   - variables.remaining.length === 0

2. 部分成功（success: true）
   - 一部の変数が置換されずに残った
   - variables.detected.length > variables.replaced.length
   - variables.remaining.length > 0

3. ゼロ置換（success: true）
   - 変数が検出されなかった
   - variables.detected.length === 0
   - variables.replaced.length === 0
   - variables.remaining.length === 0

4. 失敗（success: false）
   - テンプレートの読み込みに失敗
   - バリデーションエラー
   - その他のエラー

## 採用理由

1. シンプルさ
   - 成功/失敗の判定が明確
   - 必要な情報のみを提供
   - インターフェースが理解しやすい

2. 目的に特化
   - 変数置換に焦点を当てた設計
   - 置換結果の詳細な情報を提供
   - テンプレート内容の保持

3. 実用性
   - エラー情報が明確
   - 統計情報でデバッグが容易
   - テストが書きやすい

## 使用例

```typescript
// 完全成功
{
  success: true,
  templatePath: "templates/hello.md",
  content: "Hello John!",
  variables: {
    detected: ["name"],
    replaced: ["name"],
    remaining: []
  }
}

// 部分成功
{
  success: true,
  templatePath: "templates/greeting.md",
  content: "Hello John! Today is {day}.",
  variables: {
    detected: ["name", "day"],
    replaced: ["name"],
    remaining: ["day"]
  }
}

// ゼロ置換
{
  success: true,
  templatePath: "templates/static.md",
  content: "Hello World!",
  variables: {
    detected: [],
    replaced: [],
    remaining: []
  }
}

// 失敗
{
  success: false,
  error: "Template file not found: template.md",
  templatePath: "template.md",
  variables: {
    detected: [],
    replaced: [],
    remaining: []
  }
}
```

## 設計の経緯

当初は複雑なエラー処理や段階的な結果報告を検討したが、ライブラリの本質的な目的である「テンプレートの変数置換」に焦点を当て直した。変数置換の結果を正確に報告し、テンプレートのパスと置換後の内容を保持するという基本機能に注力することで、シンプルで理解しやすいインターフェースを実現した。特に、変数の検出数と置換数の情報を提供することで、利用者が置換結果を正確に把握できるようにした。また、テンプレートのパスを保持することで、必要に応じて元のテンプレートを参照できるようにした。エラー時は処理が完了していないため、content プロパティを省略することで、より明確な意図の表明と型安全性の向上を実現した。