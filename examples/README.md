# Examples

This directory contains usage examples for `@tettuan/breakdownprompt`.

## Examples

### Basic Usage (`basic_usage.ts`)

A basic example that generates a prompt into a single file.

```bash
deno run --allow-read --allow-write examples/basic_usage.ts
```

### Multiple Files Output (`multiple_files.ts`)

An example that splits the prompt into multiple files.

```bash
deno run --allow-read --allow-write examples/multiple_files.ts
```

### Structured Output (`structured_output.ts`)

An example that generates the prompt in a structured format.

```bash
deno run --allow-read --allow-write examples/structured_output.ts
```

## Directory Structure

```
examples/
  ├── templates/
  │   ├── task/
  │   │   └── implementation/
  │   │       └── f_design.md
  │   ├── schema/
  │   │   └── implementation.json
  │   └── input/
  │       └── design.md
  ├── basic_usage.ts
  ├── multiple_files.ts
  └── structured_output.ts
```

## Prerequisites

- Required template files are included in the `examples/templates` directory.
- The `output` directory will be created automatically. 