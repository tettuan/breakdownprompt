---
name: review
description: Review code changes for quality, correctness, and adherence to project conventions. Use when user says 'review', 'レビュー', or asks to check code quality.
argument-hint: "[file-or-path]"
allowed-tools: [Read, Grep, Glob, Bash]
---

# Code Review

Review code changes for quality and correctness.

## Steps

1. If `$ARGUMENTS` is provided, review the specified file or path.
   Otherwise, review staged or unstaged git changes via `git diff`.

2. Check for:

### Type Safety
- Strict mode compliance
- Proper use of `PromptResult`, `PromptParams`, `Variables` types
- No `any` types without justification

### Naming Conventions
- Template variables: `{snake_case}` with curly braces (hyphens allowed)
- TypeScript code: camelCase for variables/functions, PascalCase for types/classes
- Test files: `*_test.ts`

### Error Handling
- Use project error classes: `ValidationError`, `TemplateError`, `FileSystemError`
- Proper error propagation via `PromptResult.success`

### Path Validation
- File-related parameters validated through `src/validation/path_validator.ts`
- No absolute paths in implementation code (see `/absolute-path-checker`)

### Test Coverage
- Corresponding tests exist in `tests/` for new/changed functionality
- Tests follow the hierarchy: `01_unit/` -> `02_integration/` -> `03_system/`

### Import Policy (MUST)
- **MUST** use import map aliases from `deno.json` (e.g., `@std/assert`, `@std/path`)
- **NEVER** use inline `jsr:`, `npm:`, or `https://deno.land/` in import statements
- Violation causes `no-import-prefix` lint failure in CI
- New dependencies: add to `deno.json` imports first, then use the alias

### Formatting
- 2-space indent, no tabs, 100 char line width
- Double quotes, semicolons

3. Report findings with file paths and line numbers.
