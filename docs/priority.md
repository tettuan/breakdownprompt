# Special Character Handling

- Variable names in prompt files
  - Special characters are ignored as they don't match variable name rules
- File PATH names
  - Special characters are excluded for security reasons
  - Tests must verify this exclusion
- Inside prompts
  - Everything except variable names is treated as prompt text
  - Special characters are part of the prompt text and should not be excluded
  - No need for HTML entity conversion or interpretation

Follow these rules:

- Maintain variable name validation rules
- Maintain file path validation rules
- Remove special character escape processing for variable values

# File Permissions

- No need for test verification. If permissions are missing, an error will occur, which is acceptable.
