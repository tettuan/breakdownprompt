import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";

const _logger = new BreakdownLogger();

Deno.test("Special Cases Integration Tests", async (t) => {
  await t.step("should handle empty variables", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "",
      input_markdown_file: "test-input.md",
      output_dir: "test/output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/basic_template.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });

  await t.step("should handle special characters in variables", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "# Test\n* List item\n> Quote",
      input_markdown_file: "test_input.md",
      output_dir: "test/output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/basic_template.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
  });

  await t.step("should handle template with multiple sections", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "# Test Content",
      input_markdown_file: "test_input.md",
      output_dir: "test/output",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/structured.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("# Section 1"), true);
    assertEquals(result.prompt.includes("# Section 2"), true);
  });
});
