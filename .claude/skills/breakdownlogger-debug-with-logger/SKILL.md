---
name: breakdownlogger-debug-with-logger
description: Use when debugging test failures, investigating behavior, or running tests with BreakdownLogger output. Guides the 3-phase debugging workflow and environment controls. Trigger words - 'debug', 'デバッグ', 'test failure', 'テスト失敗', 'investigate', '調査', 'LOG_LEVEL', 'LOG_KEY'.
allowed-tools: Read, Grep, Glob, Bash
---

# Debug with Logger

全出力から始めるとノイズにパターンが埋没するので、3つの直交する制御次元（level × length × key）を段階的に絞り込む。

## Three Dimensions

| 次元 | 変数 | 問い | 値 |
|------|------|------|-----|
| Level | `LOG_LEVEL` | 深刻度は？ | `debug/info/warn/error` |
| Length | `LOG_LENGTH` | 詳細度は？ | (未設定)/`S`/`L`/`W` |
| Key | `LOG_KEY` | どのコンポーネント？ | カンマ区切りキー |

## Three-Phase Workflow

```bash
# Phase 1: エラーのみで障害箇所を特定
LOG_LEVEL=error deno test --allow-env --allow-read --allow-write
# Phase 2: KEY で絞り込み + 短縮表示
LOG_LEVEL=debug LOG_KEY=<key> LOG_LENGTH=S deno test --allow-env --allow-read --allow-write
# Phase 3: 特定テストの全データ確認
LOG_LEVEL=debug LOG_KEY=<key> LOG_LENGTH=W deno test --allow-env --allow-read --allow-write tests/<file>_test.ts
```

## Project KEYs

| KEY | 対象 |
|-----|------|
| `prompt` | PromptManager（オーケストレーション。TemplateFile のログもこの KEY で出力） |
| `replace` | VariableReplacer/Matcher/Processor（変数置換） |
| `validate` | PathValidator/VariableValidator/ParameterValidator（全検証） |
| `file` | FileUtils（ファイルI/O） |

よく使う組み合わせ: `LOG_KEY=prompt,validate`（大半）/ `LOG_KEY=replace`（変数置換）/ `LOG_KEY=file,validate`（パス・ファイル）

`LOG_KEY` は完全一致。KEY 一覧の最新取得: `grep -rn 'new BreakdownLogger(' --include='*.ts' src/`

## Decision Guide

| 症状 | アクション |
|------|-----------|
| 出力なし | `LOG_LEVEL` 確認（デフォルト=`info`） |
| 出力過多 | `LOG_KEY=<component>` 追加 |
| 切り詰め(`...`) | `LOG_LENGTH` を上げる: 未設定→`S`→`L`→`W` |
| 特定テストのみエラー | テストファイルパスを追加 |
| KEY 不明 | `grep -rn 'new BreakdownLogger(' --include='*.ts' src/` |

ERROR は stderr、それ以外は stdout。`2> stderr.log` でエラー分離、`2>&1 | tee debug.log` で全出力。コミット前に `deno run --allow-read jsr:@tettuan/breakdownlogger/validate [target-dir]` で一時ロガーの本番混入を防ぐ。
