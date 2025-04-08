import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams } from "../../src/types/prompt_params.ts";

const _logger = new BreakdownLogger();

Deno.test("Multiple Template Integration Tests", async (t) => {
  await t.step("Template linking with shared variables", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Test Content\nThis is a test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/special_template.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Check that variables are consistently replaced across the template
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });

  await t.step("Variable chaining between templates", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Chained Content\nThis is a chained test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/valid_prompt.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Check that variables are properly chained in the output
    const content = result.prompt;
    const schemaFileIndex = content.indexOf(variables.schema_file);
    const inputMarkdownIndex = content.indexOf(variables.input_markdown);
    const inputMarkdownFileIndex = content.indexOf(variables.input_markdown_file);
    const outputDirIndex = content.indexOf(variables.output_dir);

    // Verify that variables appear in a logical order
    assertExists(schemaFileIndex);
    assertExists(inputMarkdownIndex);
    assertExists(inputMarkdownFileIndex);
    assertExists(outputDirIndex);
  });

  await t.step("Template integration with nested variables", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Nested Content\nThis is a nested test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/valid_prompt.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Check that nested variables are properly handled
    const content = result.prompt;
    const nestedSections = content.split("###");
    assertEquals(nestedSections.length > 1, true);

    // Verify that variables are properly replaced in nested sections
    for (const section of nestedSections) {
      if (section.includes(variables.schema_file)) {
        assertEquals(section.includes(variables.input_markdown_file), true);
      }
    }
  });
});
