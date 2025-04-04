# @tettuan/breakdownprompt Examples

This directory contains examples demonstrating how to use the @tettuan/breakdownprompt library.

## Examples Overview

### 1. Basic Usage (`basic_usage.ts`)
Demonstrates the core functionality:
- Loading a prompt file
- Replacing variables with provided values
- Basic error handling

### 2. Validation Example (`validation_example.ts`)
Shows how to implement validation:
- Variable validation
- Error handling for invalid inputs
- Path validation
- Markdown format validation

## Template Structure

The `templates/` directory contains the markdown templates used by the examples:

- `basic_prompt.md`: Basic template showing variable replacement
- `validation_prompt.md`: Template demonstrating validation scenarios

## Directory Structure

```
examples/
├── templates/
│   ├── basic_prompt.md
│   ├── validation_prompt.md
│   ├── schema/
│   ├── input/
│   └── task/
├── basic_usage.ts
├── validation_example.ts
└── README.md
```

## Running Examples

To run an example:

```bash
deno run --allow-read --allow-env examples/basic_usage.ts
deno run --allow-read --allow-env examples/validation_example.ts
```

## Notes

- All examples use the core variables defined in the documentation:
  - `schema_file`
  - `input_markdown`
  - `input_markdown_file`
  - `destination_path`
- Examples demonstrate proper error handling and validation
- Each example focuses on specific use cases and features
