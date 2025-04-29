import { assertEquals } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";

const _logger = new BreakdownLogger();

Deno.test("File Integration Tests", async (t) => {
  await t.step("should process template with file paths", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "# Test Content\nThis is a test.",
      input_markdown_file: "test-input.md",
      output_dir: "test/output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/basic_template.md",
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });

  await t.step("should handle relative paths", async () => {
    const variables = {
      schema_file: "./schema/test-schema.json",
      input_markdown: "# Test Content\nThis is a test.",
      input_markdown_file: "./input/test-input.md",
      output_dir: "./output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/basic_template.md",
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });
});
