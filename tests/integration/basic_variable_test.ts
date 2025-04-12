import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams } from "../../src/types/prompt_params.ts";

Deno.test("Basic Variable Test", async (t) => {
  const logger = new BreakdownLogger();

  await t.step("Basic variable replacement", async () => {
    logger.debug("Starting basic variable replacement test");
    const variables = {
      input_markdown_file: "tests/fixtures/input/sample.md",
      input_markdown: await Deno.readTextFile("tests/fixtures/input/sample.md"),
      schema_file: "tests/fixtures/schema/base.schema.json",
      output_dir: "tests/fixtures/output/",
      destination_path: "tests/fixtures/output/",
    };
    logger.debug("Variables prepared", variables);

    const manager = new PromptManager();
    const result = await manager.generatePrompt("tests/fixtures/templates/basic_template.md", variables);
    logger.debug("Generated prompt", { promptContent: result.prompt });

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.output_dir), true);
  });

  await t.step("Special characters", async () => {
    logger.debug("Starting special characters test");
    const variables = {
      test_var: "Test value with special chars: & < > \" '",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt("tests/fixtures/templates/basic_template.md", variables);
    logger.debug("Generated prompt", { promptContent: result.prompt });

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("&amp;"), true);
    assertEquals(result.prompt.includes("&lt;"), true);
    assertEquals(result.prompt.includes("&gt;"), true);
  });
});
