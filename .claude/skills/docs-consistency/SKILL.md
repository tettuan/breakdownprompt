---
name: docs-consistency
description: Verify and fix documentation to match implementation. Use when updating docs, releasing versions, or when user mentions 'docs consistency', 'docs verify', 'ドキュメント更新', 'docsを直して'.
allowed-tools: [Read, Edit, Grep, Glob, Bash]
---

# Docs Consistency

Docs explain implementation; they do not rewrite design.
Flow: design intent (What/Why) -> implementation survey (How) -> docs update (explanation).

## Phase 1: Extract Design Intent

Read design docs (`docs/`) and identify What, Why, constraints, and what users need to know.

Key design docs for breakdownprompt:
- `docs/design_pattern.md` / `docs/design_pattern.ja.md`
- `docs/type_of_variables.ja.md` / `docs/variables.ja.md`
- `docs/path_validation.md`
- `docs/return_specification.ja.md`

## Phase 2: Survey Implementation

Identify implementation files, public API, defaults, and edge cases.

Key implementation files:
- `mod.ts` - Public exports
- `src/core/prompt_manager.ts` - Main API
- `src/types/` - Type definitions
- `src/validation/` - Validators
- `src/replacers/` - Variable replacers

## Phase 3: Diff Against Current Docs

Compare design + implementation against current docs. Build a diff table:

| Item | Design/Implementation | Current docs | Gap |
|------|----------------------|-------------|-----|
| Reserved variables | 4 types | Documented | None |
| Custom variables | Hyphen support | Missing | Add |

## Phase 4: Fix Docs

Do not change design docs — only update implementation-facing docs.

| Priority | Target |
|----------|--------|
| 1 | README.md |
| 2 | docs/user_guide.md |
| 3 | docs/api_reference.md |

## Phase 5: Verify

```bash
# Check public exports match docs
grep "^export" mod.ts

# Check documented types exist
grep -r "PromptManager\|PromptResult\|PromptParams\|Variables" docs/ README.md

# Check code examples in docs
grep -A 5 "```typescript" README.md docs/user_guide.md
```

## Phase 6: Language

| Pattern | Language |
|---------|---------|
| `*.md` | English (primary) |
| `*.ja.md` | Japanese (supplementary) |

## Checklist

```
Phase 1: - [ ] Read docs/, identified design intent
Phase 2: - [ ] Identified implementation files, surveyed public API
Phase 3: - [ ] Built diff table against current docs
Phase 4: - [ ] Updated README.md and relevant docs
Phase 5: - [ ] Verified consistency (exports, types, examples)
```

## Related Skills

| Skill | Purpose | When |
|-------|---------|------|
| `docs-consistency` | Verify & fix | Release prep, periodic review |
| `update-docs` | Create & update | Feature additions, changes |
| `update-changelog` | CHANGELOG update | Feature completion |
