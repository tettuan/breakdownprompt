# Special Character Handling

## Variable Names in Prompt Files

- Special characters are ignored as they don't match variable naming rules

## File Path Names

- Special characters are excluded for security reasons
- Tests must verify that special characters are excluded

## Inside Prompts

- Content outside of variable names is treated as prompt text
- Special characters are part of the prompt text and should not be excluded
