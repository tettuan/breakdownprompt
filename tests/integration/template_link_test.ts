import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";

const _logger = new BreakdownLogger();

Deno.test("Template Linking Tests", async (t) => {
  await t.step("should handle linked templates with shared variables", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Test Content\nThis is a test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/valid_prompt.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });

  await t.step("should handle template with multiple variable references", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Test Content\nThis is a test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/valid_prompt.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);

    // Count occurrences of each variable
    const schemaCount = (result.prompt.match(new RegExp(variables.schema_file, "g")) || []).length;
    const inputCount =
      (result.prompt.match(new RegExp(variables.input_markdown_file, "g")) || []).length;

    assertEquals(schemaCount > 1, true, "Schema file should be referenced multiple times");
    assertEquals(inputCount > 1, true, "Input file should be referenced multiple times");
  });
});
