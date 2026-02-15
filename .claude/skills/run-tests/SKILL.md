---
name: run-tests
description: Run tests with debug logging. Use when user says 'test', 'テスト', or asks to verify changes.
argument-hint: "[test-file-path]"
allowed-tools: [Bash, Read, Grep, Glob]
---

Run the specified test file with debug output.

```bash
LOG_LEVEL=debug deno test $ARGUMENTS --allow-env --allow-write --allow-read
```

If no argument is provided, run all tests:

```bash
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read
```

## Test hierarchy

Tests are in `tests/` with the following structure:

```
tests/
├── 00_fixtures/   # Test fixtures and templates
├── 01_unit/       # Unit tests
├── 02_integration/ # Integration tests
└── 03_system/     # System/E2E tests
```

Test file naming: `*_test.ts`
