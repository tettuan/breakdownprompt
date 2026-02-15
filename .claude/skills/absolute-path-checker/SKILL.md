---
name: absolute-path-checker
description: Verify no absolute paths exist in implementation code when discussing tests, refactoring, portability, or directory hierarchy
allowed-tools: [Grep, Read, Edit, Bash]
---

# Absolute Path Checker

## Purpose

Ensure no absolute paths (especially HOME directory paths) exist in implementation code, maintaining portability.

## Trigger Conditions

Auto-run when working on:
- Test implementation/fixes
- Refactoring
- Portability improvements
- Directory structure changes

## Procedure

### 1. Search for absolute paths

Search implementation files (.ts, .js) for:

```bash
# HOME directory absolute paths
grep -r "/Users/" --include="*.ts" --include="*.js" src/
grep -r "/home/" --include="*.ts" --include="*.js" src/

# Root-based absolute paths (excluding config files)
grep -r '"/[a-z]' --include="*.ts" --include="*.js" src/
```

### 2. Classify results

| Type | Action |
|------|--------|
| **Literals in implementation** | Must convert to relative path |
| **Test output/logs** | Allowed (but not in test assertions) |
| **Config defaults** | Replace with env vars or relative paths |
| **Documentation/comments** | Allowed |

### 3. Convert to relative paths

Priority order:

1. **Use existing variables**: `Deno.cwd()`, project-defined base paths
2. **Use import.meta** (Deno/ESM):
   ```typescript
   const __dirname = new URL(".", import.meta.url).pathname;
   const configPath = join(__dirname, "../config.json");
   ```
3. **Relative path literals**:
   ```typescript
   // Before
   const path = "/Users/dev/project/data/file.txt";
   // After
   const path = "./data/file.txt";
   ```

### 4. Run tests after changes

```bash
deno task test
```

## Notes

- `$HOME` and `~` paths are treated the same as absolute paths
- Paths from `Deno.env.get("HOME")` are allowed
- Use `join()` or `resolve()` for path construction, not string concatenation
