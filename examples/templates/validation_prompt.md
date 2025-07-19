# Validation Example

This prompt demonstrates validation and error handling.

## Schema Validation

Attempting to use schema from: {schema_file}

## Text Validation

Content to validate:
{input_text}

## File Validation

Attempting to read from: {input_text_file}

## Output Path

Will be saved to: {destination_path}

Note: This example will fail validation due to:

1. Directory traversal attempt in schema path
2. Invalid text format
3. Absolute path attempt in input file
