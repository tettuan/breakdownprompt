# API Reference

## Table of Contents

1. [PromptManager](#promptmanager)
2. [Interfaces](#interfaces)
3. [Types](#types)
4. [Error Handling](#error-handling)

## PromptManager

The main class for managing prompts and template processing.

### Constructor

```typescript
constructor(options?: PromptManagerOptions)
```

#### Options

```typescript
interface PromptManagerOptions {
  debug?: boolean; // Enable debug logging
  cacheSize?: number; // Template cache size
  validatePaths?: boolean; // Enable path validation
}
```

### Methods

#### generatePrompt

Generates a prompt from a template with variable replacement.

```typescript
async generatePrompt(params: PromptParams): Promise<PromptResult>
```

##### Parameters

```typescript
interface PromptParams {
  prompt_file_path: string; // Path to the prompt template
  variables: Variables; // Variables for replacement
  multipleFiles?: boolean; // Generate multiple files
  structured?: boolean; // Use structured output
}
```

##### Returns

```typescript
interface PromptResult {
  content: string; // Generated content
  metadata?: Metadata; // Optional metadata
  files?: GeneratedFile[]; // Generated files (if multipleFiles is true)
}
```

#### validateTemplate

Validates a template file and its variables.

```typescript
async validateTemplate(templatePath: string, variables: Variables): Promise<ValidationResult>
```

##### Returns

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}
```

## Interfaces

### Variables

```typescript
interface Variables {
  schema_file?: string; // Path to schema file
  input_markdown?: string; // Markdown content
  input_markdown_file?: string; // Path to markdown file
  destination_path?: string; // Output destination path
}
```

### Metadata

```typescript
interface Metadata {
  generatedAt: Date; // Generation timestamp
  templateVersion: string; // Template version
  variablesUsed: string[]; // Variables used in generation
}
```

### GeneratedFile

```typescript
interface GeneratedFile {
  path: string; // File path
  content: string; // File content
  metadata?: FileMetadata; // File-specific metadata
}
```

## Types

### ValidationError

```typescript
interface ValidationError {
  code: string; // Error code
  message: string; // Error message
  context?: any; // Error context
}
```

### ValidationWarning

```typescript
interface ValidationWarning {
  code: string; // Warning code
  message: string; // Warning message
  context?: any; // Warning context
}
```

## Error Handling

### Error Codes

| Code | Description               |
| ---- | ------------------------- |
| E001 | Template file not found   |
| E002 | Invalid variable format   |
| E003 | Missing required variable |
| E004 | File permission error     |
| E005 | Template parsing error    |
| E006 | Variable validation error |

### Example Error Handling

```typescript
try {
  const result = await manager.generatePrompt(params);
} catch (error) {
  if (error.code === "E001") {
    console.error("Template file not found:", error.context.path);
  } else if (error.code === "E002") {
    console.error("Invalid variable:", error.context.variable);
  }
  // Handle other error codes...
}
```

### Debug Mode

Enable debug mode for detailed error information:

```typescript
const manager = new PromptManager({ debug: true });
```

This will provide additional context in error messages and log detailed processing information.
