---
name: run-tests
description: Run tests with debug logging. Use when user says 'test', 'テスト', or asks to verify changes.
argument-hint: "[test-file-path]"
allowed-tools: [Bash, Read, Grep, Glob]
---

変更を検証するため、テストをデバッグ出力付きで実行する。

```bash
# 指定ファイル
LOG_LEVEL=debug deno test $ARGUMENTS --allow-env --allow-write --allow-read
# 全テスト（引数なし時）
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read
```

テスト階層: `tests/` — `00_fixtures/` (fixture) → `01_unit/` → `02_integration/` → `03_system/`。ファイル命名: `*_test.ts`
