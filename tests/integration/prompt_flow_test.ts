import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams as _PromptParams } from "../../src/types/prompt_params.ts";

const _logger = new BreakdownLogger();

Deno.test("Basic Use Case Tests", async (t) => {
  await t.step("Basic prompt generation with all variables", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Test Content\nThis is a test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
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

  await t.step("Multiple variable occurrences", async () => {
    const variables = {
      input_markdown_file: "tests/fixtures/input/basic.md",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/basic_template.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);
    _logger.debug("Prompt content:", result.prompt);
    const occurrences = (result.prompt.match(
      new RegExp(variables.input_markdown_file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
    ) || [])
      .length;
    _logger.debug("Number of occurrences:", occurrences);
    assertEquals(occurrences, 6); // Template has 6 occurrences of input_markdown_file
  });

  await t.step("Structured prompt with sections", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Section Test\nThis is a section test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt(
      "tests/fixtures/templates/basic_template.md",
      variables,
    );

    assertExists(result);
    assertEquals(result.success, true);
    // Check section headers are preserved
    assertEquals(result.prompt.includes("## Input Section"), true);
    assertEquals(result.prompt.includes("## Schema Section"), true);
    assertEquals(result.prompt.includes("## Output Section"), true);
  });
});
