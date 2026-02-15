---
name: fix-checklist
description: Use when about to fix code, modify implementation, or address errors. MUST read before saying "fix", "修正します", "直す", "対処する". Prevents symptom-driven fixes.
allowed-tools: [Read, Glob, Grep]
---

# Before You Fix: Stop and Think

**Read this BEFORE making any code changes.**

## The Rule

```
Stop. Think carefully. Verify one by one. Dig deeper.
```

## Why This Exists

Symptom-driven fixes are wrong fixes. Seeing an error and immediately "fixing" it without understanding WHY leads to:

- Breaking the design
- Introducing new bugs
- Wasting time on wrong solutions

## Checklist (Do Not Skip)

### 1. Stop

Do NOT write code yet. Do NOT edit files yet.

### 2. Ask "Why?"

The error is a symptom. Ask:
- Why is this error occurring?
- What is the system trying to do?
- What did the system expect vs what happened?

### 3. Read the Design

Before changing ANY code:
- Find the relevant design document in `docs/`
- Read it completely
- Understand the intended behavior

Key locations for breakdownprompt:
- `docs/design_pattern.md` - Architecture and design patterns
- `docs/type_of_variables.ja.md` / `docs/variables.ja.md` - Variable system design
- `docs/path_validation.md` - Path validation rules
- `docs/return_specification.ja.md` - Return value contracts
- `src/types/` - Type definitions (interface contracts)

### 4. Trace the Flow

Follow the execution path:
1. What triggered this code?
2. What state was expected?
3. Where did it diverge?

For breakdownprompt, typical flow:
```
PromptManager.generatePrompt()
  → TemplateFile (load template)
  → ParameterManager (validate params)
  → VariableProcessor (replace variables)
    → VariableMatcher (find variables in template)
    → Replacers (substitute values)
  → PromptResult (return result)
```

### 5. Identify Root Cause

The fix location is often NOT where the error appears.

| Error Location | Root Cause Location |
|----------------|---------------------|
| Runtime validation | Type definitions in `src/types/` |
| Variable not replaced | Replacer in `src/replacers/` |
| Path validation error | Validator in `src/validation/` |
| Test failure | Implementation logic in `src/core/` |

### 6. Verify Your Understanding

Before fixing, state:
- What is the root cause?
- Why does the design work this way?
- What is the minimal correct fix?

### 7. Then Fix

Only now: make the smallest change that addresses the root cause.

## Anti-Patterns

**Bad**: "Error says X not found, so add X"

**Good**: "Error says X not found. Why is X expected? What does the design say about X?"

## Investigation Output

For complex problems, write investigation results to `tmp/`:

```
tmp/investigation/<issue-name>/
├── overview.md      # Problem overview (mermaid diagram required)
├── trace.md         # Execution flow trace
└── root-cause.md    # Root cause and fix plan
```

Rules:
1. Use mermaid diagrams to visualize structure
2. Keep each file under 500 lines
3. Focus on identifying the essential structure of the problem
