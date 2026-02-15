---
name: local-ci
description: Run local CI checks before merge or push. Use when user says 'CI', 'ローカルCI', or before creating PRs.
allowed-tools: [Bash, Read]
---

Run the local CI script to validate the project.

## Steps

1. Run `scripts/local_ci.sh`
2. If errors occur, re-run with debug logging: `DEBUG=true scripts/local_ci.sh`
3. Report results

## CI pipeline stages (local_ci.sh)

1. **Lock regeneration** - Remove and regenerate deno.lock
2. **Type check** - `deno check` on entry points and all src/*.ts
3. **JSR check** - `npx jsr publish --dry-run --allow-dirty`
4. **Tests** - All test files in `tests/` hierarchically, then full suite with `-A`
5. **Type check** - `deno check mod.ts`
6. **Format** - `deno fmt --check`
7. **Lint** - `deno lint`

DO NOT push until all checks pass.
