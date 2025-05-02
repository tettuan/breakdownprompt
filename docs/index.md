# Library Overview

Loads prompts from provided arguments and options.
Replaces variables (standardized strings) within the loaded prompts with received parameter values.
Output is written to standard output.

For detailed usage instructions, please refer to the [User Guide](./user_guide.md).
For detailed API specifications, please refer to the [API Reference](./api_reference.md).

# Parameter List

- prompt_file_path : Path to the prompt file (required)
- variables : Key-value set of variables to be replaced in the prompt (required)
  - Details are defined in "Target Variables for Replacement"

# Prompt File Handling

The prompt file path is received directly as an argument. Path construction is not performed within the library.

## Declaration and Parameters

prompt_file_path is specified during initialization.

# Prompt Loading and Parameter Value Replacement

## Output Format

All outputs display the prompt content. The content is output after performing "replacement processing".

Example: Input prompt content:

```prompt
# example prompt

this is a prompt contents. {input_markdown_file} {input_markdown}

# schema

{schema_file}

# destination path

{destination_path}
```

Output:

```
# example prompt 
this is a prompt contents.
./.agent/breakdown/issues/12345_something.md
# input markdown
this is a input markdown contents.

# schema
./rules/schema/task/base.schema.json

# destination path
./.agent/breakdown/tasks/
```

## Replacement Processing

Replacement processing assigns one class to each variable name. The class defines the rules for replacement processing.

The flow is as follows:

1. Scan the prompt file and declare a class when a variable is found.
2. Pass the parameters required by the class to the instance. Delegate value generation to each class.
3. Each class returns the generated value.
   3-1. Create a parent class that simply "returns the value as is"
   3-2. Each variable class inherits from the parent class in 3-1

### Target Variables for Replacement

Details are defined in `./type_of_variables.md`.

The variables allowed in the received parameters are as follows. Accessible via variables.schema_file.

- schema_file
- input_markdown
- input_markdown_file
- destination_path

- Value constraints for each variable:
  - `schema_file`: Valid file path format
  - `input_markdown`: Markdown format text
  - `input_markdown_file`: Valid file path format
  - `destination_path`: Valid directory path format

- Detection method:
  - Simple string matching to detect `{variable_name}` pattern
  - Regular expressions are not used

- Value validation rules:
  - Path existence verification
  - File read permission verification
  - Markdown format checking
  - Path normalization processing

#### Key Constraint Rules

1. Key naming rules:
   - Only alphanumeric characters and underscores allowed
   - Must start with a letter
   - Case-sensitive naming rules are flexible

2. Key uniqueness:
   - Duplicate keys are not allowed
   - Case-sensitive

3. Key requirement:
   - All keys are optional
   - No required keys exist

4. Key validation timing:
   - Batch validation during initialization

5. Error handling:
   - Output to debug log when invalid keys are detected
   - Continue execution (no errors raised)
   - Ignore invalid keys and continue processing

- When the same variable appears multiple times, replace all with the same value
- Variable replacement order follows system call order (order doesn't matter)
- Recursive processing is not required
- Variable escape notation detection is not required (not detected)

# Error Handling

- Target variables for replacement are pre-specified
  - When non-specified variables are found, output at debug log level
  - Continue without raising exceptions

# Testing

- Implement hierarchical testing from unit tests of core functionality to integration tests, expanding coverage to final use cases
- Use BreakdownLogger in test code for debugging

## Path Validation Rules

For path validation rules, please refer to [Path Validation Rules](./path_validation.md).

## Special Character Handling

For special character handling, please refer to [Special Character Handling](./priority.md).

## Variable Type Definitions

For variable type definitions, please refer to [Variable Type Definitions](./type_of_variables.md).

## Security Considerations

Minimize local file operations.

- Path injection prevention
- Special character processing
- File access permission verification
- No handling of sensitive information (logs are only output to console)

## Performance Considerations

Not required. The processing is inherently lightweight.
