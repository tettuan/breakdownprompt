# Library Overview

# Table of Contents

## Basic Information

Provides essential information that developers should know first, including basic usage, installation methods, and quick start guides.

| Document                            | Description                                                                                                                                     | When to Reference                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [User Guide](./user_guide.md)       | Provides basic usage, installation procedures, and quick start guides. Includes actual usage examples and best practices.                       | When you don't know how to use the library         |
| [API Reference](./api_reference.md) | Detailed specifications of public APIs, interfaces, type definitions, and error handling explanations. Includes usage examples for each method. | When you need to check detailed API specifications |

## Design & Specifications

Provides information about the system's design philosophy, architecture, and relationships between components.

| Document                                           | Description                                                                                                                                                        | When to Reference                                |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| [Design Pattern](./design_pattern.md)              | Explains the system's design philosophy, architecture, component responsibilities and relationships. Includes detailed behavior of each component.                 | When you want to understand the system structure |
| [Variable Definition](./variables.md)              | Explains variable concepts, relationships between reserved variables and template variables, and specifications for variable detection and replacement processing. | When you're unsure about variable handling       |
| [Variable Type Definition](./type_of_variables.md) | Explains implementation details of the variable type system, validation rules, and type extension methods. Includes details of TypeScript type definitions.        | When you want to check variable type definitions |
| [Return Specification](./return_specification.md)  | Explains API return value specifications, error handling, and methods for classifying and processing results.                                                      | When you want to check return value formats      |

## Development Guide

Provides guidelines that developers should follow, including development rules, conventions, and best practices.

| Document                                      | Description                                                                                                  | When to Reference                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| [Import Policy](./import_policy.md)           | Explains module import rules, version management, and security considerations. Includes Deno best practices. | When adding new dependencies      |
| [Path Validation Rules](./path_validation.md) | Explains file path and directory path validation rules, security considerations, and error messages.         | When implementing path processing |

## Testing & Quality

Provides information for ensuring quality, including test strategies, quality management, and debugging methods.

| Document                                    | Description                                                                                                        | When to Reference                              |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| [Testing](./test.md)                        | Explains test hierarchy structure, execution methods, and debug mode usage. Includes test data management methods. | When writing tests                             |
| [Special Character Handling](./priority.md) | Explains special character processing rules, security considerations, and test requirements.                       | When unsure about special character processing |

## Security & Operations

Provides information about operations, including security measures, operational considerations, and troubleshooting.

| Document               | Description                                                                                                       | When to Reference                              |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| [UML Diagrams](./uml/) | Visual representation of system structure, component relationships, and process flows. Includes various diagrams. | When you want to understand the overall system |

Loads prompts from provided arguments and options as text templates. Content parsing is not required.
Replaces variables (standardized strings) within the loaded template with received parameter values.
Output is written to standard output as text.

# Parameter List

- template_file : Path to the prompt template file (required)
- variables : Key-value set of variables to be replaced in the template (required)
  - For details, see [Variable Definition](./variables.md)
  - All values in variables are optional

# Variable Relationships

Variables are structured in the following relationships. For detailed relationships, see [Detailed Variable Relationships](./variables.md#variable-relationships).

1. Reserved Variables
   - Predefined variable names and corresponding classes
   - Variable names are fixed and have corresponding classes
   - Example: `schema_file`, `input_text`, `input_text_file`, `destination_path`

2. variables Parameter
   - Only accepts reserved variables
   - All variables are optional (can be empty)
   - Variables other than reserved variables will result in an error

3. Template Variables
   - Extracted using `{variable_name}` notation in the template
   - Variable names depend on template content
   - Only replaced if they match reserved variables

4. Variable Replacement Processing
   - When template variables match reserved variables
   - Corresponding reserved variable class executes processing
   - Uses values from variables if they exist
   - Otherwise, follows class definition for processing

# Prompt File Handling

The path to the prompt template file is received directly as an argument. Path construction is not performed within the library.

## Declaration and Parameters

template_file is specified during initialization.

# Prompt Loading and Parameter Value Replacement

## Output Format

All outputs display the prompt content as text. Content is displayed after performing "replacement processing".

Example: Input template prompt content:

```prompt
# example prompt

this is a prompt contents. {input_text_file}

# schema

{schema_file}

# destination path

{destination_path}
```

Output:

```
# example prompt 
this is a prompt contents. ./.agent/breakdown/issues/12345_something.md

# schema
./rules/schema/task/base.schema.yml

# destination path
./.agent/breakdown/tasks/
```

## Replacement Processing

Replacement processing assigns one class to one variable name. Classes define the rules for replacement processing.

The flow is:

1. Parameter Validation
   - Check for required parameters
   - Validate variable name format
   - Validate path validity

2. Template Processing
   - Load template file
   - Extract and validate variables

3. Variable Replacement Processing
   - Execute validation based on type
   - Replace variables
   - Handle errors

### Target Variables for Replacement

Variables are defined in two aspects:

1. Reserved Variables: Predefined variable names, corresponding types, and classes that process variables
2. Template Variables: Variable names discovered during template scanning

For details, see [Variable Definition](./variables.md).

The variables parameter accepted by BreakdownPrompt allows the following variables. Accessible via variables.schema_file.

- schema_file
- input_text
- input_text_file
- destination_path

- Value constraints for each variable
  - `schema_file`: Valid file path format
  - `input_text`: Text format content
  - `input_text_file`: Valid file path format
  - `destination_path`: Valid directory path format

- Detection Method
  - Simple string matching to detect `{variable_name}` pattern
  - No regular expressions used
  - No nested variable processing

- Value Validation Rules
  - Path existence check
  - File read permission check
  - Text format check
  - Path normalization

- Validation Errors
  - Returns error type
    - Includes ENUM for error type determination
    - Includes error-specific messages
  - Returns to caller at first error

#### Variable Name (Key) Constraint Rules

1. Key Naming Rules
   - Only alphanumeric and underscore allowed
   - Must start with a letter
   - Case-sensitive naming rules allowed

2. Key Uniqueness
   - No duplicate keys allowed
   - Case-sensitive

3. Key Optionality
   - All keys are optional
   - No required keys

4. Key Validation Timing
   - Batch validation at initialization

5. Error Handling
   - Output invalid keys to debug log
   - Continue execution (no error thrown)
   - Ignore invalid keys and continue processing

- If the same variable appears multiple times, replace all with the same value
- Variable replacement order follows system call order (order independent)
- No recursive processing needed
- No need to detect variable escape notation (not detected)

### Replacement Processing Loop and Circular Reference Prevention

1. Template is loaded only once (no repeated loading)
2. Process template line by line
3. Detect variable "outer brackets" for each line
4. Check if detected "outer bracket" content matches variable key name
5. Non-matching variables are returned unchanged, matching variables are replaced through replacement processing class
6. No recursive processing of the same location

# Error Handling

- Target variables for replacement are pre-specified
  - Log at debug level if non-specified variables found
  - No exceptions thrown, continue processing

# Testing

- Hierarchical testing from core functionality unit tests to integration and final use case coverage expansion
- Include BreakdownLogger in test code for debugging

## Security Considerations

Minimal local file operations.

- Path injection prevention
- Special character handling
- File access permission verification
- No confidential information handling (logs only output to console)

## Performance Considerations

Not needed. Processing is inherently lightweight.

# Prompt Management System Specification

## 1. Overview

The prompt management system is a framework for template-based prompt generation and variable replacement. It receives template files and variable parameters, performs validation and replacement processing, and generates the final prompt.

For detailed use cases, see [User Guide](./user_guide.md).
For detailed API specifications, see [API Reference](./api_reference.md).

## 2. System Configuration

### 2.1 Input Parameters

- `template_file`: Path to the prompt template file (required)
- `variables`: Key-value set of variables to be replaced in the template (required)
  - For details, see [Variable Definition](./variables.md)

### 2.2 Output Format

All outputs display the prompt content as text. Content is displayed after performing "replacement processing".

Example:

```markdown
# example prompt

this is a prompt contents. ./.agent/breakdown/issues/12345_something.md

# schema

./rules/schema/task/base.schema.yml

# destination path

./.agent/breakdown/tasks/
```

## 3. Template File

### 3.1 Definition

Template files are text files containing variables. They have the following characteristics:

- Extensions: `.md`, `.txt`, `.yml`
- Content: Text
- Variable format: `{variable_name}`
- Validation: Only existence check as text file
- Note: Recommended to edit with markdown editor

### 3.2 File Format

#### 3.2.1 Supported Extensions

- `.md`: Markdown files
- `.txt`: Plain text files
- `.yml`: YAML files

#### 3.2.2 Validation Rules

1. File existence check
2. Extension validation (only `.md`, `.txt`, `.yml` allowed)
3. Check if readable as text file

#### 3.2.3 Error Handling

- Non-existent file: `TemplateFileNotFoundError`
- Invalid extension: `InvalidTemplateFileExtensionError`
- Unreadable: `TemplateFileReadError`

### 3.3 Variable Definition

Variables in templates are defined in the following format:

```markdown
{variable_name}
```

#### 3.3.1 Variable Name Rules

- Only alphanumeric and underscore allowed
- Must start with a letter
- Case-sensitive

#### 3.3.2 Variable Constraints

- If same variable appears multiple times, replace all with same value
- Variable replacement order follows system call order
- No recursive processing needed
- No need to detect variable escape notation

## 4. Replacement Processing

### 4.1 Processing Flow

1. Parameter Validation
   - Check for required parameters
   - Validate variable name format
   - Validate path validity

2. Template Processing
   - Load template file
   - Extract and validate variables

3. Variable Replacement Processing
   - Execute validation based on type
   - Replace variables
   - Handle errors

### 4.2 Variable Detection and Processing

- Simple string matching to detect `{variable_name}` pattern
- No regular expressions used
- Template loaded only once
- Process template line by line
- Detect variable "outer brackets" for each line
- Check if detected "outer bracket" content matches variable key name
- Non-matching variables returned unchanged, matching variables replaced through replacement processing class
- No recursive processing of same location

## 5. Error Handling

### 5.1 Variable-related Errors

- Log at debug level if non-specified variables found
- No exceptions thrown, continue processing

### 5.2 Validation Errors

- Returns error type
  - Includes ENUM for error type determination
  - Includes error-specific messages
- Returns to caller at first error

## 6. Security and Performance

### 6.1 Security Considerations

- Path injection prevention
- Special character handling
- File access permission verification
- No confidential information handling (logs only output to console)

For details, see [Special Character Handling](./priority.md).

### 6.2 Performance Considerations

- No special considerations needed due to lightweight processing

## 7. Testing

### 7.1 Test Strategy

- Hierarchical testing from core functionality unit tests to integration and final use case coverage expansion
- Include BreakdownLogger in test code for debugging

For details, see [Testing Policy](./test.md).

### 7.2 Path Validation

For details, see [Path Validation Rules](./path_validation.md).
