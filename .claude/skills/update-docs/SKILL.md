---
name: update-docs
description: Use when implementing new features, changing behavior, or modifying the public API. Documents changes in README and relevant docs.
allowed-tools: [Read, Edit, Grep, Glob, Bash]
---

# Documentation Update

## Purpose

Ensure user-facing changes are properly documented across all relevant locations.

## Trigger Conditions

- Adding new public API methods or types
- Changing existing behavior
- Adding new features or capabilities
- Modifying variable replacement rules
- Making breaking changes

## Documentation Locations

| Location | Purpose | Update Criteria |
|----------|---------|-----------------|
| `README.md` | Quick reference, installation, usage | Major features, API changes |
| `docs/user_guide.md` | Detailed usage guide | Complex features, tutorials |
| `docs/api_reference.md` | API documentation | All public API changes |
| `docs/design_pattern.md` | Architecture docs | Structural changes |
| `docs/path_validation.md` | Path validation rules | Validation behavior changes |
| `.claude/CLAUDE.md` | Development guidelines | Internal workflow changes |

## Decision Matrix

```
Change Type → Documentation Scope
├── New public API (type, function, class)
│   ├── README.md: Brief mention with example
│   ├── docs/api_reference.md: Full signature and usage
│   └── mod.ts: Export and JSDoc comment
├── New feature
│   ├── README.md: Brief description
│   └── docs/user_guide.md: Detailed usage (if complex)
├── Behavior change
│   ├── README.md: Update existing description
│   └── CHANGELOG.md: Note the change
├── Variable system change
│   ├── README.md: Update template format section
│   └── docs/variables.ja.md / docs/type_of_variables.ja.md: Update design docs
└── Internal change
    └── .claude/CLAUDE.md: If affects development workflow
```

## Process

1. Identify what changed: `git diff --name-only`
2. Categorize: API change? Feature? Behavior change?
3. Update appropriate documentation locations
4. Verify code examples in docs still work

## Guidelines

- **Concise**: One sentence per feature in README
- **Example-first**: Show usage before explaining
- **Searchable**: Include keywords users would search for

## What NOT to Document

- Internal implementation details (unless in design docs)
- Temporary workarounds
- Debug-only options
