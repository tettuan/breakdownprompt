---
name: refactoring
description: Use when refactoring code, reorganizing modules, renaming types, deleting old paths, or migrating architecture. MUST read before any structural code change. Prevents incomplete refactoring.
allowed-tools: [Read, Glob, Grep, Edit, Write, Bash, Task]
---

# Refactoring

Prove the new path inherits every contract from the old path before deleting it. If you cannot prove it, do not delete.

## Failure Patterns

| Pattern | Why it breaks | Prevention |
|---------|--------------|------------|
| Old path deleted + new path incomplete | Contract breaks in intermediate state | List all contracts in Before/After table before deleting |
| Build cache inconsistency | Cache serves old module instead of updated one | Run --reload or clear cache after every change |
| Dead code left behind | Produces false positives in grep/search | Delete superseded code in the same PR |
| Documentation not updated | Users cannot discover changes | Grep docs for changed names and update all references |

## Phase 1: Inventory

Map everything being removed or changed before writing any code.

**1. Removal Inventory** — List what is being removed, who consumes it.

```markdown
| Item | File | Consumers |
|------|------|-----------|
| PromptManager.oldMethod | src/core/prompt_manager.ts:42 | tests, mod.ts |
```

**2. Consumer Audit** — Grep imports and call sites. If any consumer has no migration target, deletion is not allowed.

```bash
grep -r "OldName" --include="*.ts" src/ tests/ mod.ts
```

## Phase 2: Contract & Verification

**3. Before/After Table** — Any row with empty "After" = not ready.

```markdown
| Behavior | Before | After | Verified |
|----------|--------|-------|----------|
| schema_file replacement | SchemaFileReplacer.replace() | New implementation | [ ] |
```

**4. Verification Design** — Match proof method to complexity:

| Path characteristic | Proof method |
|--------------------|-------------|
| Straight line, 1-2 hops | Code review sufficient |
| Contains branches, filters | Automated test on boundary |
| Depends on external state | E2E execution |

## Phase 3: Execute

**5.** 1 commit = 1 concern. Separate: add new path -> migrate consumers -> delete old path -> update docs.

**6.** Every commit must pass `scripts/local_ci.sh`. If intermediate state breaks, commit granularity is too coarse.

**7.** Delete dead code in the same PR. "Cleanup later" never comes.

## Phase 4: Verify

**8. Cache clear**

```bash
deno cache --reload mod.ts
```

**9. Consumer grep** — Ensure zero remaining references:

```bash
grep -r "OldName" --include="*.ts" src/ tests/ mod.ts | grep -v test
```

**10. Docs grep** — Ensure zero stale references:

```bash
grep -r "OldName" --include="*.md" docs/ README.md
```

## Anti-Patterns

| Bad | Good |
|-----|------|
| Delete old path, implement new path later | Make new path work first, then delete old |
| Assume "nobody uses this" without grep | Show evidence via consumer audit |
| Combine refactor and feature in one PR | Separate for bisectability |
| Skip cache clear after refactor | Always --reload after changes |

## Related Skills

| Skill | When to use together |
|-------|---------------------|
| `fix-checklist` | Root cause analysis before deciding what to refactor |
| `docs-consistency` | Documentation updates after refactoring |
