# API Reference

## Table of Contents

1. [PromptManager](#promptmanager)
2. [Interfaces](#interfaces)
3. [Types](#types)
4. [Error Handling](#error-handling)
5. [Variable Processing](#variable-processing)

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
  - `variables`: A record of reserved variable names and their replacement values (required)
    - Only reserved variables are accepted
    - See [Variable Definition](./variables.ja.md) for details

##### Returns

An object containing:

- `success`: Whether the operation was successful
- `prompt`: The generated prompt content (if successful)
- `error`: Error message (if failed)

##### Processing Flow

1. Parameter Validation
   - Required parameters check
   - Variable name format validation (must match reserved variables)
   - Path validation for template file

2. Template Processing
   - Template file reading
   - Markdown format validation
   - Variable extraction and validation
     - Template variable detection
     - Reserved variable matching

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
  /** Reserved variables to replace in the template (required) */
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
     - Invalid variable names (must match reserved variables)
     - Invalid markdown content
     - Missing required parameters
     - Non-reserved variables detected

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

## Variable Processing

### Variable Types

Variables are defined in two aspects:
1. Reserved Variables: Predefined variable names with corresponding types and processing classes
2. Template Variables: Variable names discovered during template scanning

See [Variable Definition](./variables.ja.md) for detailed explanation.

### Reserved Variables

Reserved variables are defined in the main code and must be:
- Predefined with type and class definitions
- Passed as `variables` parameter values
- Validated against template variables

### Template Variables

Template variables are:
- Discovered during template scanning using `{variable}` notation
- Validated against reserved variables
- Replaced only if matching a reserved variable

### Variable Processing Rules

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
   - Reserved variable matching

4. **Replacement Rules**
   - Same variable is replaced with same value everywhere
   - Replacement order is arbitrary
   - No recursive processing
   - No variable escape detection
   - One-time template processing
   - Only reserved variables are processed

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
