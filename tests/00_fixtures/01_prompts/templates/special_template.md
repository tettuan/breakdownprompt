# Special Case Handling Test

## Mixed Content

The following content mixes variables with text:

- Path: {input_markdown_file}
- Schema: {schema_file}
- Output: {output_dir}

## Multiple Lines

The following variables span multiple lines:

- {input_markdown_file with line break}
- {schema_file with line break}
- {output_dir with line break}

## Special Characters in Content

The following content contains special characters:

- Path with spaces: {input_markdown_file}
- Path with dots: {schema_file}
- Path with slashes: {output_dir}

## Variables in Lists

- Input: {input_markdown_file}
- Schema: {schema_file}
- Output: {destination_path}

## Variables in Code Blocks

```
Input: {input_markdown_file}
Schema: {schema_file}
Output: {destination_path}
```

## Variables in Tables

| Type   | Path                  |
| ------ | --------------------- |
| Input  | {input_markdown_file} |
| Schema | {schema_file}         |
| Output | {destination_path}    |

## Complex Structures

### Section 1: Multiple Variables

Processing {input_markdown_file} with {schema_file} to {destination_path}. Content: {input_markdown}

### Section 2: Repeated Variables

- First use: {input_markdown_file}
- Second use: {input_markdown_file}
- Third use: {input_markdown_file}

### Section 3: Mixed Content

1. File: {input_markdown_file}
2. Content: {input_markdown}
3. Schema: {schema_file}
4. Output: {destination_path}

## Edge Cases

### Case 1: Empty Lines

{input_markdown_file}

{schema_file}

{destination_path}

### Case 2: Special Characters

Path with spaces: {input_markdown_file} Path with dots: {schema_file} Path with slashes:
{destination_path}

### Case 3: Markdown Features

**Bold**: {input_markdown_file} _Italic_: {schema_file} `Code`: {destination_path}

### Case 4: Trailing Spaces

- & Ampersand
- {output_dir}
- {input_markdown_file} and {schema_file}

# Special Characters Test

## Text with Special Characters

& Ampersand
< Less than

> Greater than
> " Double quote
> ' Single quote

## Text with Whitespace

Double space
Tab character
Space at end

## Variable Replacement

Simple variable: {test_var}
