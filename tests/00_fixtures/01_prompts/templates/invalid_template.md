# Invalid Prompt Template

This template demonstrates various invalid cases and error conditions.

## Invalid Variable Names

- {123invalid} - Starts with number
- {invalid-name} - Contains hyphen
- {invalid name} - Contains space
- {invalid@name} - Contains special character

## Malformed Variables

- {input_markdown_file - Missing closing brace
- input_markdown_file} - Missing opening brace
- {input_markdown_file}} - Extra closing brace
- {{input_markdown_file} - Extra opening brace

## Special Characters

- {input_markdown_file} with special chars: !@#$%^&*()
- {schema_file} with quotes: "quoted text"
- {destination_path} with backslashes: C:\path\to\file
- {input_markdown} with newlines: line 1 line 2

## Empty Variables

- {}
- { }
- { }

## Duplicate Variables with Different Cases

- {input_markdown_file}
- {INPUT_MARKDOWN_FILE}
- {InputMarkdownFile}

## Invalid Nesting

- {input_markdown_file{schema_file}}
- {{input_markdown_file}}
- {input_markdown_file}{schema_file}
