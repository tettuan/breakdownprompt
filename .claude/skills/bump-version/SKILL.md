---
name: bump-version
description: Bump the project version for release. Use when user says 'version', 'バージョン', or preparing a release.
argument-hint: "[--major|--minor|--patch] [--status] [--step]"
disable-model-invocation: true
allowed-tools: [Bash, Read]
---

Run the version bump script with PR workflow.

```bash
scripts/bump_version.sh $ARGUMENTS
```

Default: `--patch`

## Version files

| File | Field |
|------|-------|
| `deno.json` | `"version": "x.y.z"` |
| `src/version.ts` | `export const VERSION = "x.y.z"` |

Both files MUST have matching versions.

## Script workflow

```
A-1: Version update (deno.json, src/version.ts) with JSR latest check
A-2: Local CI check → commit & push
A-3: Create PR to develop
B-1: Wait for PR merge (remote CI must pass)
B-2: Create PR to main
C-1: Wait for PR merge (remote CI must pass)
C-2: Create vtag on main merge commit
```

Use `--status` to check progress. Use `--step` for single-step execution.

Only run when explicitly ordered. Do not speculate about releases.
