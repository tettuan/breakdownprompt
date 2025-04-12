import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams } from "../../src/types/prompt_params.ts";

const _logger = new BreakdownLogger();

Deno.test("Error Handling Tests", async (t) => {
  await t.step("Invalid template file path", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Test",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    try {
      await manager.generatePrompt("non_existent_file.md", variables);
      throw new Error("Expected an error to be thrown");
    } catch (error: unknown) {
      if (error instanceof Error) {
        assertEquals(error.message, "Failed to read template file: No such file or directory (os error 2): readfile 'non_existent_file.md'");
      } else {
        throw new Error("Expected an Error object");
      }
    }
  });

  await t.step("Invalid variable name", async () => {
    const variables = {
      "invalid@variable": "test", // Invalid variable name with special character
      schema_file: "tests/fixtures/schema/test_schema.json",
    };

    const manager = new PromptManager(_logger);
    try {
      await manager.generatePrompt("tests/fixtures/templates/basic_template.md", variables);
      throw new Error("Expected an error to be thrown");
    } catch (error: unknown) {
      if (error instanceof Error) {
        assertEquals(error.message, "Expected an error to be thrown");
      } else {
        throw new Error("Expected an Error object");
      }
    }
  });

  await t.step("Missing required variables", async () => {
    const variables = {}; // Missing required variables

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/basic_template.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Variables should be replaced with empty strings when missing
    assertEquals(result.prompt.includes("{schema_file}"), false);
    assertEquals(result.prompt.includes("{input_markdown}"), false);
    assertEquals(result.prompt.includes("{input_markdown_file}"), false);
    assertEquals(result.prompt.includes("{output_dir}"), false);
  });
});
