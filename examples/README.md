# @tettuan/breakdownprompt Examples

This directory contains practical examples demonstrating how to use the @tettuan/breakdownprompt library in real-world scenarios.

## Examples Overview

### 1. Basic Usage (`basic_usage.ts`)
A foundational example showing the core functionality:
- Loading a prompt template
- Setting up variables for replacement
- Basic error handling
- Simple output generation

### 2. Task Generation (`generate_task_prompt.ts`)
Shows how to generate a task description prompt:
- Creating structured task descriptions
- Specifying input files and output locations
- Using templates for consistent task formatting

### 3. Code Review (`generate_code_review.ts`)
Demonstrates generating code review prompts:
- Creating review requests with specific criteria
- Managing review files and output locations
- Structuring review guidelines

### 4. Documentation Generation (`generate_documentation.ts`)
Shows how to generate documentation prompts:
- Creating documentation requests
- Managing source files and output locations
- Specifying documentation requirements

### 5. Input Text File Only (`input_text_file_only.ts`)
Demonstrates using only file-based input:
- Using file paths for template and variables
- Handling file-based input text
- Managing output locations

### 6. Absolute Path Usage (`absolute_path_usage.ts`)
Shows how to use absolute paths with PromptParams:
- Using absolute paths for input and output
- Handling path validation
- Managing file operations with absolute paths

### 7. Temporary Path Usage (`temp_path_usage.ts`)
Demonstrates handling temporary files:
- Creating and using temporary directories
- Managing temporary file paths
- Cleaning up temporary resources

## Template Structure

The `templates/` directory contains markdown templates for different use cases:

- `basic_prompt.md`: Simple template for basic usage
- `task_prompt.md`: Template for generating task descriptions
- `code_review.md`: Template for code review requests
- `documentation.md`: Template for documentation generation

## Directory Structure

```
examples/
├── templates/
│   ├── basic_prompt.md
│   ├── task_prompt.md
│   ├── code_review.md
│   ├── documentation.md
│   ├── schema/
│   ├── input/
│   └── output/
├── basic_usage.ts
├── generate_task_prompt.ts
├── generate_code_review.ts
├── generate_documentation.ts
├── input_text_file_only.ts
├── absolute_path_usage.ts
├── temp_path_usage.ts
└── README.md
```

## Running Examples

To run an example:

```bash
# Start with the basic example
deno run --allow-read --allow-env --allow-run examples/basic_usage.ts

# Then try the use case examples
deno run --allow-read --allow-env --allow-run examples/generate_task_prompt.ts
deno run --allow-read --allow-env --allow-run examples/generate_code_review.ts
deno run --allow-read --allow-env --allow-run examples/generate_documentation.ts

# Run examples with file-based input
deno run --allow-read --allow-env --allow-run examples/input_text_file_only.ts
deno run --allow-read --allow-env --allow-run examples/absolute_path_usage.ts

# Run temporary file example (requires write permission)
deno run --allow-read --allow-env --allow-run --allow-write examples/temp_path_usage.ts
```

## Use Case Patterns

Each example demonstrates a common use case pattern:

1. **Basic Usage**
   - Initialize PromptManager
   - Set up template and variables
   - Generate and display output

2. **Task Generation**
   - Define task parameters
   - Specify input/output locations
   - Generate structured task description

3. **Code Review**
   - Define review criteria
   - Specify files to review
   - Generate review request

4. **Documentation**
   - Define documentation requirements
   - Specify source files
   - Generate documentation request

## Notes

- All examples use the core variables:
  - `schema_file`: For validation and structure
  - `input_text`: For main content
  - `input_text_file`: For file-based input
  - `destination_path`: For output location
- Templates can be customized for specific needs
- Error handling is included for robustness
- Start with `basic_usage.ts` to understand the fundamentals
