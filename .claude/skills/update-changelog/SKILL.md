---
name: update-changelog
description: Use when completing features, fixes, or changes that should be recorded. Updates CHANGELOG.md with concise, searchable entries following Keep a Changelog format.
allowed-tools: [Read, Edit, Grep, Glob]
---

# CHANGELOG Update

## Purpose

Maintain a clear, searchable record of changes in CHANGELOG.md.

## Trigger Conditions

- Completing a new feature
- Fixing a bug
- Making breaking changes
- Changing existing behavior
- Removing functionality

## Format

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

### Section Types

| Section | Use When |
|---------|----------|
| `Added` | New feature or capability |
| `Changed` | Existing behavior modified |
| `Deprecated` | Feature will be removed |
| `Removed` | Feature was removed |
| `Fixed` | Bug fix |
| `Security` | Security vulnerability fix |

## Writing Good Entries

### Principles

1. **Searchable**: Include keywords users would search for
2. **Concise**: One line per change
3. **User-focused**: Describe the impact, not the implementation
4. **Specific**: Include variable names, type names, or config names

### Good Examples

```markdown
### Added
- Custom variable support with `{variable-name}` syntax (hyphens allowed)
- `Variables` type for typed variable definitions

### Changed
- `PromptManager.generatePrompt()` now validates all reserved variables before replacement

### Fixed
- Fixed `{destination_path}` replacement failing when path contains spaces
```

### Bad Examples

```markdown
# Too vague
### Added
- New feature for templates

# Too implementation-focused
### Changed
- Refactored VariableReplacer to use async/await

# Missing context
### Fixed
- Fixed the bug
```

## Process

1. Read current CHANGELOG.md (create if it doesn't exist)
2. Identify change category (Added/Changed/Fixed/etc.)
3. Write one-line entry: `<What>: <Impact> (\`identifier\`)`
4. Place under `[Unreleased]` section
5. During release, move entries to `[x.y.z] - YYYY-MM-DD`
