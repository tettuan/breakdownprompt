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

this is a prompt contents. {input_text_file} {input_text}

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
# input text
this is a input text contents.

# schema
./rules/schema/task/base.schema.json

# destination path
./.agent/breakdown/tasks/
```
