# Special Case Handling Test

## Escaped Variables

The following variables are escaped:

- \{input_markdown_file\}
- \{schema_file\}
- \{output_dir\}

## Nested Variables

The following variables are nested:

- {input_markdown_file_{schema_file}}
- {schema_file_{output_dir}}
- {output_dir_{input_markdown_file}}

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

## Nested Variables

### Case 1: Adjacent Variables

The input file is {input_markdown_file} and the schema is {schema_file}. Output will be written to
{destination_path}.

### Case 2: Variables in Lists

- Input: {input_markdown_file}
- Schema: {schema_file}
- Output: {destination_path}

### Case 3: Variables in Code Blocks

```
Input: {input_markdown_file}
Schema: {schema_file}
Output: {destination_path}
```

### Case 4: Variables in Tables

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

- &amp; Ampersand 
- {output_dir} 
- {input_markdown_file} and {schema_file} 