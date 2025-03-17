# Prompt Management Framework

A Deno TypeScript library for managing and generating prompts from templates with variable replacement.

## Features

- Dynamic prompt template management
- Variable replacement with type validation
- Support for multiple output formats
- Template caching for improved performance
- Structured and unstructured output options
- Comprehensive error handling

## Installation

```bash
deno add @your-username/prompt-management
```

## Usage

```typescript
import { PromptManager, DefaultConfig } from "@your-username/prompt-management";

// Initialize the manager
const manager = new PromptManager("./templates", new DefaultConfig());

// Define prompt parameters
const params = {
  demonstrativeType: "task",
  layerType: "implementation",
  fromLayerType: "design",
  destination: "./output",
  multipleFiles: false,
  structured: false,
  validate() {
    return true;
  },
};

// Generate prompt
try {
  const result = await manager.generatePrompt(params);
  console.log("Generated prompt:", result.content);
} catch (error) {
  console.error("Error generating prompt:", error.message);
}
```

## Template Format

Templates are markdown files with variables in the format `{variable_name}`. Supported variables:

- `{schema_file}`: Path to the schema file
- `{input_markdown}`: Content of the input markdown
- `{input_markdown_file}`: Path to the input markdown file
- `{destination_path}`: Output destination path

Example template:
```markdown
# Task Implementation

## Input
{input_markdown}

## Schema
{schema_file}

## Output Location
{destination_path}
```

## Directory Structure

```
templates/
  ├── task/
  │   └── implementation/
  │       └── f_design.md
  ├── schema/
  │   └── implementation.json
  └── input/
      └── design.md
```

## API Reference

### PromptManager

Main class for managing prompts.

```typescript
class PromptManager {
  constructor(baseDir: string, config: Config);
  generatePrompt(params: PromptParams): Promise<PromptResult>;
}
```

### Config

Configuration options.

```typescript
interface Config {
  cacheSize: number;
  timeout: number;
  validate(): boolean;
}
```

### PromptParams

Parameters for prompt generation.

```typescript
interface PromptParams {
  demonstrativeType: string;
  layerType: string;
  fromLayerType: string;
  destination: string;
  multipleFiles: boolean;
  structured: boolean;
  validate(): boolean;
}
```

## Development

### Running Tests

```bash
deno test
```

### Code Formatting

```bash
deno fmt
```

### Linting

```bash
deno lint
```

## License

MIT 