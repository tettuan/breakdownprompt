# 返却仕様変更の移行計画

## 1. 変換プロセスの分析

### 1.1 現在の変換プロセス
```typescript
// src/core/prompt_manager.ts
public async generatePrompt(
  templatePathOrContent: string,
  variables: Record<string, string>,
): Promise<PromptGenerationResult> {
  // 1. テンプレートの読み込みと検証
  // 2. 変数の抽出と検証
  // 3. 変数の置換
  // 4. 結果の生成
}
```

### 1.2 変換結果の生成ポイント
1. 成功時:
   ```typescript
   return {
     success: true,
     prompt,
     variables: templateVars,
     unknownVariables: templateVars.filter(...)
   };
   ```
2. エラー時:
   ```typescript
   return {
     success: false,
     error: error.message
   };
   ```

## 2. 実装変更箇所の洗い出し

### 2.1 型定義の更新
対象ファイル: `src/types/prompt_result.ts`
```typescript
// 新しい型の追加
export interface PromptResult {
  success: boolean;
  error?: string;
  templatePath: string;
  content?: string;
  variables: {
    detected: string[];
    replaced: string[];
    remaining: string[];
  };
}

// 既存の型の非推奨化
/** @deprecated Use PromptResult instead */
export interface PromptGenerationResult { ... }
/** @deprecated Use PromptResult instead */
export interface PromptSuccessResult { ... }
/** @deprecated Use PromptResult instead */
export interface PromptErrorResult { ... }
```

### 2.2 PromptManager の更新
対象ファイル: `src/core/prompt_manager.ts`
```typescript
// 1. メソッドのシグネチャ変更
public async generatePrompt(
  templatePathOrContent: string,
  variables: Record<string, string>,
): Promise<PromptResult> { ... }

// 2. 変数統計情報の追加
const detected = this.extractTemplateVariables(templateContent);
const replaced = detected.filter(v => v in variables && variables[v]);
const remaining = detected.filter(v => !(v in variables) || !variables[v]);

// 3. 結果生成の更新
return {
  success: true,
  templatePath: templatePathOrContent,
  content: prompt,
  variables: {
    detected,
    replaced,
    remaining
  }
};

// 4. エラー処理の更新
return {
  success: false,
  templatePath: templatePathOrContent,
  error: error.message,
  variables: {
    detected: [],
    replaced: [],
    remaining: []
  }
};
```

### 2.3 テストの更新
対象ファイル:
- `tests/01_unit/04_core/03_prompt_manager_test.ts`
- `tests/01_unit/01_core/01_prompt_manager_test.ts`
- `tests/01_unit/02_core/02_prompt_manager_test.ts`

```typescript
// 1. 新しいテストケースの追加
Deno.test("PromptManager - 変数統計情報", async () => {
  const result = await promptManager.generatePrompt(
    testTemplatePath,
    { name: "test" }
  );
  assertEquals(result.variables.detected.length, 1);
  assertEquals(result.variables.replaced.length, 1);
  assertEquals(result.variables.remaining.length, 0);
});

// 2. 既存テストの更新
Deno.test("PromptManager - エラーケース", async () => {
  const result = await promptManager.generatePrompt(
    "nonexistent.md",
    {}
  );
  assertEquals(result.success, false);
  assertEquals(result.templatePath, "nonexistent.md");
  assertEquals(result.variables.detected.length, 0);
});
```

### 2.4 ドキュメントの更新
対象ファイル:
- `docs/api_reference.md`
- `docs/return_specification.ja.md`
- `README.md`

```markdown
// 1. API ドキュメントの更新
## PromptResult
```typescript
interface PromptResult {
  success: boolean;
  error?: string;
  templatePath: string;
  content?: string;
  variables: {
    detected: string[];
    replaced: string[];
    remaining: string[];
  };
}
```

// 2. 使用例の更新
const result = await manager.generatePrompt("template.md", { name: "test" });
if (result.success) {
  console.log("Generated prompt:", result.content);
  console.log("Detected variables:", result.variables.detected);
  console.log("Replaced variables:", result.variables.replaced);
  console.log("Remaining variables:", result.variables.remaining);
}
```

### 2.5 サンプルコードの更新
対象ファイル:
- `examples/generate_task_prompt.ts`
- `examples/generate_code_review.ts`
- `examples/generate_documentation.ts`

```typescript
// サンプルコードの更新
const result = await manager.generatePrompt(template, variables);
if (result.success) {
  console.log("Generated prompt:", result.content);
  console.log("Template path:", result.templatePath);
  console.log("Variables:", result.variables);
} else {
  console.error("Error:", result.error);
}
```

## 3. 移行スケジュール

### 3.1 フェーズ1: 型定義の更新（1日）
- `src/types/prompt_result.ts` の更新
- 型の非推奨化

### 3.2 フェーズ2: PromptManager の更新（2日）
- `src/core/prompt_manager.ts` の更新
- 変数統計情報の実装
- エラー処理の更新

### 3.3 フェーズ3: テストの更新（1日）
- テストファイルの更新
- 新しいテストケースの追加
- 既存テストの修正

### 3.4 フェーズ4: ドキュメントの更新（1日）
- API ドキュメントの更新
- サンプルコードの更新
- README の更新

