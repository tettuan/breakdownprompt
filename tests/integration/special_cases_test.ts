import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams } from "../../src/types/prompt_params.ts";

Deno.test("Special Cases Tests", async (t) => {
  const logger = new BreakdownLogger();

  await t.step("Escaped variables", async () => {
    logger.debug("Starting escaped variables test");
    const variables = {
      input_markdown_file: "tests/fixtures/input/sample.md",
    };
    logger.debug("Variables prepared", variables);

    const manager = new PromptManager(logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/special_template.md", variables);
    logger.debug("Generated prompt", { promptContent: result.prompt });

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(
      result.prompt.includes("\\{input_markdown_file\\}"),
      true,
      "Escaped variable not preserved",
    );
  });

  await t.step("Nested variables", async () => {
    logger.debug("Starting nested variables test");
    const variables = {
      input_markdown_file: "tests/fixtures/input/sample.md",
      schema_file: "tests/fixtures/schema/base.schema.json",
    };
    logger.debug("Variables prepared", variables);

    const manager = new PromptManager(logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/special_template.md", variables);
    logger.debug("Generated prompt", { promptContent: result.prompt });

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(
      result.prompt.includes("{input_markdown_file_{schema_file}}"),
      true,
      "Nested variable not preserved",
    );
  });

  await t.step("Line ending preservation", async () => {
    logger.debug("Starting line ending test");
    const variables = {
      test_var: "value",
      input_markdown_file: "tests/fixtures/input/sample.md",
      schema_file: "tests/fixtures/schema/base.schema.json",
      output_dir: "tests/fixtures/output/",
      destination_path: "tests/fixtures/output/",
    };
    logger.debug("Variables prepared", variables);

    const manager = new PromptManager(logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/special_template.md", variables);
    logger.debug("Generated prompt", { promptContent: result.prompt });

    assertExists(result);
    assertEquals(result.success, true);
    // Check if trailing spaces are preserved where needed
    assertEquals(
      result.prompt.includes("&amp; Ampersand "),
      true,
      "Special character with trailing space not preserved",
    );
    assertEquals(
      result.prompt.includes("tests/fixtures/output/ "),
      true,
      "Trailing space not preserved for destination path",
    );
    assertEquals(
      result.prompt.includes("{input_markdown_file} and {schema_file} "),
      true,
      "Trailing space not preserved for variable placeholders",
    );
  });

  await t.step("Full template comparison", async () => {
    logger.debug("Starting full template comparison test");
    const variables = {
      input_markdown_file: "tests/fixtures/input/sample.md",
      input_markdown: await Deno.readTextFile("tests/fixtures/input/sample.md"),
      schema_file: "tests/fixtures/schema/base.schema.json",
      output_dir: "tests/fixtures/output/",
      destination_path: "tests/fixtures/output/",
    };
    logger.debug("Variables prepared", variables);

    const manager = new PromptManager(logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/special_template.md", variables);
    logger.debug("Generated prompt", { promptContent: result.prompt });

    const expectedContent = await Deno.readTextFile("tests/fixtures/output/special_expected.md");
    logger.debug("Expected content loaded");

    // Log differences if they exist
    if (result.prompt !== expectedContent) {
      logger.error("Content mismatch found", {
        actualLength: result.prompt.length,
        expectedLength: expectedContent.length,
        firstDiffIndex: [...result.prompt].findIndex((char, i) => char !== expectedContent[i]),
        actualSnippet: result.prompt.substring(
          Math.max(0, [...result.prompt].findIndex((char, i) => char !== expectedContent[i]) - 20),
          Math.min(
            result.prompt.length,
            [...result.prompt].findIndex((char, i) => char !== expectedContent[i]) + 20,
          ),
        ),
        expectedSnippet: expectedContent.substring(
          Math.max(0, [...result.prompt].findIndex((char, i) => char !== expectedContent[i]) - 20),
          Math.min(
            expectedContent.length,
            [...result.prompt].findIndex((char, i) => char !== expectedContent[i]) + 20,
          ),
        ),
      });
    }

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt, expectedContent);
  });
});
