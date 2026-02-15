# BreakdownPrompt - Project Context

## Overview
Deno TypeScript library for managing and generating prompts from templates with variable replacement.
Published as `@tettuan/breakdownprompt` on JSR.

## Branch Rules (MUST FOLLOW)

**NEVER commit directly to `main` or `develop`.** All changes go through this flow:

```
feature/*, fix/*, refactor/*, docs/*  (work branches)
  ↓ PR (squash merge)
release/vX.Y.Z
  ↓ PR (merge commit)
develop
  ↓ PR (merge commit)
main → vtag → JSR publish (automatic)
```

### When starting any work:

1. Determine the current release branch: `git branch -a | grep release`
2. If a release branch exists, branch from it: `git checkout -b feature/xxx release/vX.Y.Z`
3. If no release branch exists, create one from develop first:
   ```
   git checkout develop && git pull origin develop
   git checkout -b release/vX.Y.Z
   ```
   Then branch from it: `git checkout -b feature/xxx`

### When committing:

- Commit to your work branch (feature/*, fix/*, refactor/*, docs/*)
- NEVER commit to main or develop directly
- Push and create PR to the release branch

### Branch naming:

| Type | Prefix | Example |
|------|--------|---------|
| New feature | `feature/` | `feature/add-custom-variables` |
| Bug fix | `fix/` | `fix/path-validation-error` |
| Refactoring | `refactor/` | `refactor/replacer-module` |
| Documentation | `docs/` | `docs/update-api-reference` |
| Release prep | `release/` | `release/v1.2.6` |

### Prohibited operations:

- `git push origin main` — NEVER
- `git push origin develop` — NEVER
- `git commit` while on main or develop — NEVER
- `git checkout -b feature/* main` — NEVER (branch from release/*)
- `git checkout -b feature/* develop` — NEVER (branch from release/*)

## Tech Stack
- Runtime: Deno
- Language: TypeScript (strict mode)
- Testing: `deno test` with `@std/testing` and `@std/assert`
- Logging: `@tettuan/breakdownlogger`
- CI: `scripts/local_ci.sh` (local), GitHub Actions (remote)

## Project Structure
- `mod.ts` - Package entry point (public exports)
- `src/` - Source code
  - `core/` - Core logic (PromptManager, VariableReplacer, VariableMatcher, VariableProcessor)
  - `validation/` - Validators (path, variable, markdown, reserved variable, parameter)
  - `replacers/` - Variable replacer implementations (schema_file, input_text, input_text_file, destination_path)
  - `types/` - Type definitions (PromptParams, PromptResult, Variables)
  - `errors/` - Error classes (ValidationError, TemplateError, FileSystemError)
  - `utils/` - Utilities (format, file, error handler)
  - `version.ts` - VERSION constant and META
- `tests/` - Test hierarchy
  - `00_fixtures/` - Test fixtures and templates
  - `01_unit/` - Unit tests
  - `02_integration/` - Integration tests
  - `03_system/` - System/E2E tests
- `docs/` - Documentation (English *.md + Japanese *.ja.md)
- `scripts/` - Shell scripts
  - `local_ci.sh` - Local CI pipeline
  - `bump_version.sh` - Version bump with PR workflow

## Public API
```typescript
export { PromptManager } from "./src/core/prompt_manager.ts";
export type { PromptResult } from "./src/types/prompt_result.ts";
export type { PromptParams } from "./src/types/prompt_params.ts";
export type { Variables } from "./src/types/variables.ts";
export { FileSystemError, TemplateError, ValidationError } from "./src/errors.ts";
export { META, VERSION } from "./src/version.ts";
```

## Conventions
- Variable format in templates: `{variable_name}` (curly braces, snake_case, hyphens allowed)
- Reserved variables: `schema_file`, `input_text`, `input_text_file`, `destination_path`
- Formatting: 2-space indent, no tabs, 100 char line width, double quotes, semicolons
- Test file naming: `*_test.ts`
- Import policy: use `@std/` (JSR), not `https://deno.land/` URLs

## Version Management
- `deno.json` → `"version": "x.y.z"`
- `src/version.ts` → `export const VERSION = "x.y.z"`
- Both MUST match. Automated via `scripts/bump_version.sh`

## Commands
- `deno task test` - Run tests
- `deno task fmt` - Format code
- `deno task lint` - Lint code
- `scripts/local_ci.sh` - Full local CI
- `scripts/bump_version.sh` - Version bump with PR workflow
