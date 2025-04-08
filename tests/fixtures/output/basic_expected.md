# Basic Variable Replacement Test

## Input Markdown

The input markdown file is located at: tests/fixtures/input/sample.md

## Schema

The schema file is located at: tests/fixtures/schema/base.schema.json

## Output

The output will be written to: tests/fixtures/output/

## Multiple Occurrences

The input markdown file is referenced multiple times:

1. tests/fixtures/input/sample.md
2. tests/fixtures/input/sample.md
3. tests/fixtures/input/sample.md

# Example Prompt Template

This is a basic prompt template that demonstrates various variable types and structured sections.

## Input Section

Here is the content of the input markdown:

# Sample Markdown Input

This is a sample markdown file that demonstrates various markdown features.

## Text Formatting

- **Bold text** for emphasis
- _Italic text_ for subtle emphasis
- `code` for technical terms
- ~~Strikethrough~~ for removed content

## Lists

### Unordered List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Code Blocks

```typescript
interface Example {
  name: string;
  value: number;
}
```

## Tables

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Blockquotes

> This is a blockquote It can span multiple lines
>
>> And can be nested

## Links and Images

[Link to example](https://example.com)

![Example image](https://example.com/image.jpg)

## Horizontal Rule

---

## Task List

- [x] Completed task
- [ ] Pending task

## Special Characters

- &copy; Copyright symbol
- &lt; Less than
- &gt; Greater than
- &amp; Ampersand

## Schema Section

## Output Section

The input file ./tests/fixtures/input/sample.md will be processed according to the schema in
./tests/fixtures/schema/base.schema.json. The result will be saved to ./tests/fixtures/output/.

## Nested Structure

### Subsection 1

- Using ./tests/fixtures/input/sample.md for input
- Following ./tests/fixtures/schema/base.schema.json for validation

### Subsection 2

- Output to ./tests/fixtures/output/
- Content from # Sample Markdown Input

This is a sample markdown file that demonstrates various markdown features.

## Text Formatting

- **Bold text** for emphasis
- _Italic text_ for subtle emphasis
- `code` for technical terms
- ~~Strikethrough~~ for removed content

## Lists

### Unordered List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

### Ordered List

1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

## Code Blocks

```typescript
interface Example {
  name: string;
  value: number;
}
```

## Tables

| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

## Blockquotes

> This is a blockquote It can span multiple lines
>
>> And can be nested

## Links and Images

[Link to example](https://example.com)

![Example image](https://example.com/image.jpg)

## Horizontal Rule

---

## Task List

- [x] Completed task
- [ ] Pending task

## Special Characters

- &copy; Copyright symbol
- &lt; Less than
- &gt; Greater than
- &amp; Ampersand
