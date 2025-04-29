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
constructor();
```

### Methods

#### generatePrompt

Generates a prompt from a template with variable replacement.

```typescript
async generatePrompt(
  template: string,
  variables: Record<string, string>
): Promise<{ success: boolean; prompt: string }>
```

##### Parameters

- `template`: Path to the template file
- `variables`: A record of variable names and their replacement values

##### Returns

An object containing:

- `success`: Whether the operation was successful
- `prompt`: The generated prompt content

##### Throws

- `ValidationError`: If template or variables are invalid
- `FileSystemError`: If the template file cannot be read

#### writePrompt

Writes the generated prompt to a file.

```typescript
async writePrompt(content: string, destinationPath: string): Promise<void>
```

##### Parameters

- `content`: The prompt content to write
- `destinationPath`: Path where the prompt should be written

##### Throws

- `ValidationError`: If the destination path is invalid
- `FileSystemError`: If the file cannot be written

## Interfaces

### PromptParams

```typescript
interface PromptParams {
  /** Path to the template file */
  template_file: string;
  /** Variables to replace in the template */
  variables: Record<string, string>;
}
```

### PromptResult

```typescript
interface PromptResult {
  /** Whether the operation was successful */
  success: boolean;
  /** The generated prompt content, if successful */
  prompt?: string;
  /** Error message if the operation failed */
  error?: string;
}
```

## Error Handling

### Error Types

1. **ValidationError**
   - Thrown when input validation fails
   - Common causes: invalid file paths, invalid variable names, invalid markdown content

2. **FileSystemError**
   - Thrown when file operations fail
   - Common causes: file not found, permission denied, directory not found

### Example Error Handling

```typescript
try {
  const result = await manager.generatePrompt(template, variables);
  if (result.success) {
    console.log("Generated prompt:", result.prompt);
  } else {
    console.error("Error:", result.error);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation error:", error.message);
  } else if (error instanceof FileSystemError) {
    console.error("File system error:", error.message);
  } else {
    console.error("Unexpected error:", error.message);
  }
}
```

## Usage Examples

### Basic Usage

```typescript
const manager = new PromptManager();

const variables = {
  schema_file: "./schema/implementation.json",
  input_markdown: "# Design Document\n\nContent here",
  input_markdown_file: "./input/design.md",
  destination_path: "./output",
};

const result = await manager.generatePrompt("./templates/example.md", variables);
if (result.success) {
  console.log(result.prompt);
}
```

## Variable Processing Rules

1. **Allowed Variables**
   - `schema_file`: Valid file path
   - `input_markdown`: Markdown content
   - `input_markdown_file`: Valid file path
   - `destination_path`: Valid directory path

2. **Variable Detection**
   - Simple string matching for `{variable_name}` pattern
   - No regular expressions used

3. **Replacement Rules**
   - Same variable is replaced with same value everywhere
   - Replacement order is arbitrary
   - No recursive processing
   - No variable escape detection

4. **Validation Rules**
   - Path existence check
   - File read permission check
   - Markdown format check
   - Path normalization

5. **Security Considerations**
   - Minimal local file operations
   - Path injection prevention
   - Special character handling
   - File access permission verification
