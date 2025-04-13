import { assertEquals } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";

const _logger = new BreakdownLogger();

Deno.test("Structured Prompt Processing Tests", async (t) => {
  await t.step("Section structure parsing", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "# Test Content",
      input_markdown_file: "test-input.md",
      output_dir: "test/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/valid_prompt.md",
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("## Input Section"), true);
    assertEquals(result.prompt.includes("## Schema Section"), true);
    assertEquals(result.prompt.includes("## Output Section"), true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
  });

  await t.step("Variable dependency handling", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "# Test Content",
      input_markdown_file: "test-input.md",
      output_dir: "test/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/valid_prompt.md",
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });
});
