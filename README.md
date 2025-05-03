# BreakdownPrompt

A Deno TypeScript library for managing and generating prompts from templates with variable replacement.

## Quick Start

### Installation

```bash
deno add @tettuan/breakdownprompt
```

### Basic Usage

```typescript
import { PromptManager } from "@tettuan/breakdownprompt";

const manager = new PromptManager();

const result = await manager.generatePrompt("templates/example.md", {
  schema_file: "schema/implementation.json",
  input_text: "# Design Document\n\nContent here",
  input_text_file: "input/design.md",
  destination_path: "output",
});

if (result.success) {
  console.log("Generated prompt:", result.prompt);
}
```

## Features

- Dynamic prompt template management
- Variable replacement with type validation
- Comprehensive error handling
- Path validation and security checks

## Usage Guide

### Template Format

Templates are markdown files with variables in the format `{variable_name}`. Supported variables:

- `{schema_file}`: Path to the schema file (must be a valid file path)
- `{input_text}`: Content of the input text (must be valid markdown)
- `{input_text_file}`: Path to the input text file (must be a valid file path)
- `{destination_path}`: Output destination path (must be a valid directory path)

Example template:

```markdown
# Example Template

## Input

{input_text}

## Schema

{schema_file}

## Output Location

{destination_path}
```

### Error Handling

```typescript
try {
  const result = await manager.generatePrompt("template.md", {
    schema_file: "schema.json",
    input_text: "# Content",
    input_text_file: "input.md",
    destination_path: "output",
  });

  if (result.success) {
    console.log("Generated prompt:", result.prompt);
  } else {
    console.error("Error:", result.error);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation error:", error.message);
  } else if (error instanceof TemplateError) {
    console.error("Template error:", error.message);
  } else if (error instanceof FileSystemError) {
    console.error("File system error:", error.message);
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

## API Reference

### PromptManager

Main class for managing prompts.

```typescript
class PromptManager {
  constructor();
  generatePrompt(templatePath: string, variables: Record<string, string>): Promise<PromptResult>;
}
```

### PromptResult

Result of prompt generation.

```typescript
interface PromptResult {
  success: boolean; // Whether the operation was successful
  prompt?: string; // Generated prompt content
  error?: string; // Error message if failed
}
```

## For Developers

### Development Setup

1. Clone the repository:

```bash
git clone https://github.com/tettuan/breakdownprompt.git
cd breakdownprompt
```

2. Install dependencies:

```bash
deno cache --reload deps.ts
```

### Development Workflow

#### Running Tests

```bash
deno test --allow-env --allow-write --allow-read
```

For debugging:

```bash
LOG_LEVEL=debug deno test --allow-env --allow-write --allow-read
```

#### Code Quality

Formatting:

```bash
deno fmt
```

Linting:

```bash
deno lint
```

#### Publishing

To publish to JSR:

```bash
deno task publish
```

### Project Structure

```
src/
  ├── core/           # Core functionality
  ├── types/          # Type definitions
  ├── validation/     # Validation logic
  ├── replacers/      # Variable replacers
  └── errors.ts       # Error definitions
tests/                # Test files
docs/                 # Documentation
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## License

MIT
