# User Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Concepts](#core-concepts)
5. [Advanced Usage](#advanced-usage)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Introduction

The Prompt Management Framework is a Deno TypeScript library designed to help you manage and generate prompts from templates with variable replacement. It provides a robust system for handling dynamic content generation while maintaining type safety and validation.

## Installation

### From JSR (Recommended)

```bash
deno add @tettuan/breakdownprompt
```

### From GitHub

```bash
deno add https://github.com/tettuan/breakdownprompt
```

## Quick Start

Here's a simple example to get you started:

```typescript
import { PromptManager } from "@tettuan/breakdownprompt";

// Initialize the manager
const manager = new PromptManager();

// Define your prompt parameters
const params = {
  prompt_file_path: "./templates/example.md",
  variables: {
    schema_file: "./schemas/example.json",
    input_markdown: "# Example Content",
    input_markdown_file: "./input/example.md",
    destination_path: "./output",
  },
};

// Generate the prompt
try {
  const result = await manager.generatePrompt(params);
  console.log("Generated prompt:", result.content);
} catch (error) {
  console.error("Error generating prompt:", error.message);
}
```

## Core Concepts

### Variables

The framework supports several types of variables:

1. **File Path Variables**
   - `schema_file`: Path to schema definition
   - `input_markdown_file`: Path to input markdown file
   - `destination_path`: Output destination path

2. **Content Variables**
   - `input_markdown`: Markdown content

### Template Structure

Templates are markdown files that can include variables in the format `{variable_name}`. Example:

```markdown
# Project Documentation

## Input Content

{input_markdown}

## Schema Definition

{schema_file}

## Output Location

{destination_path}
```

## Advanced Usage

### Multiple File Generation

To generate multiple files from a single template:

```typescript
const params = {
  prompt_file_path: "./templates/multi-file.md",
  variables: {
    // ... variables ...
  },
  multipleFiles: true,
};
```

### Structured Output

For structured output with metadata:

```typescript
const params = {
  prompt_file_path: "./templates/structured.md",
  variables: {
    // ... variables ...
  },
  structured: true,
};
```

## Best Practices

1. **Template Organization**
   - Keep templates in a dedicated directory
   - Use meaningful names for template files
   - Document template variables in comments

2. **Variable Management**
   - Validate all paths before use
   - Use absolute paths for critical files
   - Keep variable names consistent

3. **Error Handling**
   - Always wrap prompt generation in try-catch
   - Log errors with appropriate context
   - Validate input parameters

## Troubleshooting

### Common Issues

1. **File Not Found**
   - Verify file paths are correct
   - Check file permissions
   - Ensure files exist before processing

2. **Variable Replacement Issues**
   - Check variable names match exactly
   - Verify variable values are valid
   - Ensure proper escaping of special characters

3. **Permission Errors**
   - Check read/write permissions
   - Verify directory access rights
   - Ensure proper file ownership

### Debugging

Enable debug logging:

```typescript
const manager = new PromptManager({
  debug: true,
});
```

Check the console output for detailed information about the processing steps.
