# BreakdownPrompt

テンプレートの変数置換でプロンプトを生成する Deno TypeScript ライブラリ。`@tettuan/breakdownprompt` として JSR に公開する。

## Branch Rules

main/develop への直接コミット・push は禁止。work branch → release/* → develop → main の順に PR でマージする。→ `/branch-management`

## Tech Stack

Deno / TypeScript (strict) / `@std/testing` + `@std/assert` / `@tettuan/breakdownlogger` / CI: `scripts/local_ci.sh` + GitHub Actions

## Structure

```
mod.ts                  公開エクスポート
src/core/               PromptManager, VariableReplacer, VariableMatcher, VariableProcessor
src/validation/         path, variable, markdown, reserved variable, parameter
src/replacers/          schema_file, input_text, input_text_file, destination_path
src/types/              PromptParams, PromptResult, Variables
src/errors/             ValidationError, TemplateError, FileSystemError
src/utils/              format, file, error handler
src/version.ts          VERSION, META
tests/                  00_fixtures / 01_unit / 02_integration / 03_system
docs/                   *.md (English) + *.ja.md (Japanese)
scripts/                local_ci.sh, bump_version.sh
```

## Public API

```typescript
export { PromptManager } from "./src/core/prompt_manager.ts";
export type { PromptResult } from "./src/types/prompt_result.ts";
export type { PromptParams } from "./src/types/prompt_params.ts";
export type { Variables } from "./src/types/variables.ts";
export { FileSystemError, TemplateError, ValidationError } from "./src/errors.ts";
export { META, VERSION } from "./src/version.ts";
```

## Agent Strategy

- 調査・実装・テストなど非自明なタスクには必ず Team または Sub-agent (Task tool) を使い、main コンテキストの Token をクリーンに保つこと。
- main エージェントは指揮・判断に専念し、重い処理はサブエージェントへ委譲する。

## Conventions

- テンプレート変数: `{snake_case}` (ハイフン可)。予約変数: `schema_file`, `input_text`, `input_text_file`, `destination_path`
- フォーマット: 2スペース、100文字幅、ダブルクォート、セミコロン。テスト: `*_test.ts`
- import: `deno.json` の import map エイリアス必須。インライン `jsr:`/`npm:`/`https:` は `no-import-prefix` lint 違反
- テストには実行プロセスのデバッグ用に `@tettuan/breakdownlogger` を組み込む。配置・KEY命名は → `/breakdownlogger-implement-logger`、デバッグ実行は → `/breakdownlogger-debug-with-logger`

## Commands

`deno task fmt` / `deno task lint` / → `/run-tests` (テスト) / `/local-ci` (CI) / `/bump-version` (バージョン)

## Skills

| Skill | 概要 |
|-------|------|
| `branch-management` | ブランチ戦略・PRフロー |
| `bump-version` | バージョン同期 |
| `release-procedure` | リリース手順 |
| `local-ci` | ローカルCI |
| `ci-troubleshooting` | CIエラー診断 |
| `run-tests` | テスト実行 |
| `review` | コードレビュー |
| `fix-checklist` | 修正前の根本原因特定 |
| `refactoring` | リファクタリング前の契約検証 |
| `workflow` | Conductor パターンで委譲 |
| `update-docs` | ドキュメント更新 |
| `docs-consistency` | ドキュメント⇔実装の整合性 |
| `update-changelog` | CHANGELOG更新 |
| `absolute-path-checker` | 絶対パス混入チェック |
| `breakdownlogger-implement-logger` | Logger配置・KEY命名 |
| `breakdownlogger-debug-with-logger` | 3-phase デバッグ |
