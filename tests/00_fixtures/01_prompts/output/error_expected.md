# Error Handling Test

## Invalid Variable Names

The following variables have invalid names:

- {123invalid}
- {invalid-name}
- {invalid.name}

## Malformed Variables

The following variables are malformed:

- {input_markdown_file - Missing closing brace
- {input_markdown_file} - Extra closing brace}
- {input_markdown_file - Missing both braces

## Special Characters

The following variables contain special characters:

- {input_markdown_file!}
- {input_markdown_file@}
- {input_markdown_file#}

## Empty Variables

The following variables are empty:

- {}
- { }
- { }

## Duplicate Variables

The following variables are duplicates with different cases:

- {input_markdown_file}
- {INPUT_MARKDOWN_FILE}
- {InputMarkdownFile}

## Invalid Nesting

The following variables have invalid nesting:

- {input_markdown_file{ nested }}
- {input_markdown_file{ nested } missing closing brace
