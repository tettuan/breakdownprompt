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
  params: PromptParams
): Promise<PromptResult>
```

##### Parameters

- `params`: Object containing template and variables information
  - `template_file`: Path to the template file (required)
  - `variables`: A record of variable names and their replacement values (required)

##### Returns

An object containing:

- `success`: Whether the operation was successful
- `prompt`: The generated prompt content (if successful)
- `error`: Error message (if failed)

##### Processing Flow

1. Parameter Validation
   - Required parameters check
   - Variable name format validation
   - Path validation for template file

2. Template Processing
   - Template file reading
   - Markdown format validation
   - Variable extraction and validation

3. Variable Replacement
   - Type-specific validation (path/markdown)
   - Variable replacement
   - Error handling at each step

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
  /** Path to the template file (required) */
  template_file: string;
  /** Variables to replace in the template (required) */
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
   - Common causes:
     - Invalid file paths
     - Invalid variable names (must start with letter, alphanumeric and underscore only)
     - Invalid markdown content
     - Missing required parameters

2. **FileSystemError**
   - Thrown when file operations fail
   - Common causes:
     - File not found
     - Permission denied
     - Directory not found

### Error Handling Flow

1. Parameter Validation
   - Immediate error return on validation failure
   - No partial processing
   - Clear error messages

2. Template Processing
   - Stop processing on first error
   - Return error with context
   - No partial results

3. Variable Replacement
   - Type-specific validation errors
   - Path validation errors
   - Markdown validation errors

## Variable Processing Rules

1. **Variable Types**
   - `schema_file`: Valid file path
   - `input_markdown`: Markdown content
   - `input_markdown_file`: Valid file path
   - `destination_path`: Valid directory path

2. **Variable Name Rules**
   - Alphanumeric and underscore only
   - Must start with letter
   - Case sensitive
   - No duplicate keys allowed

3. **Validation Rules**
   - Path existence check
   - File read permission check
   - Markdown format check
   - Path normalization
   - Type-specific validation

4. **Replacement Rules**
   - Same variable is replaced with same value everywhere
   - Replacement order is arbitrary
   - No recursive processing
   - No variable escape detection
   - One-time template processing

5. **Security Considerations**
   - Minimal local file operations
   - Path injection prevention
   - Special character handling
   - File access permission verification
   - No sensitive information handling

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
