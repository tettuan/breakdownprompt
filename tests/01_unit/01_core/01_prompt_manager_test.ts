/**
 * Prompt Manager Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the PromptManager class
 * - Validate prompt generation
 * - Ensure proper error handling
 *
 * Intent:
 * - Test basic prompt generation
 * - Verify template file handling
 * - Test variable replacement
 * - Validate error handling
 */

import { assertEquals, assertExists } from "jsr:@std/testing@^0.220.1/asserts";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { FileUtils } from "../../../src/utils/file_utils.ts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { TextValidator } from "../../../src/validation/markdown_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

Deno.test("PromptManager - Basic prompt generation", async (t) => {
  // Initialize PromptManager with real dependencies
  const promptManager = new PromptManager(
    new TextValidator(),
    new PathValidator(),
    new VariableValidator(),
    new FileUtils(),
  );

  await t.step("should generate a prompt from a valid template file", async () => {
    logger.debug("Testing prompt generation with valid template file");
    // Setup
    const templatePath = "tests/00_fixtures/01_templates/01_basic.md";
    const variables = { name: "test" };
    const expectedPrompt =
      "# Basic Template\n\nHello, test!\n\nThis is a basic template file for testing purposes.\n\nIt contains some sample content to verify file reading operations.\n";

    // Execute
    const result = await promptManager.generatePrompt(templatePath, variables);
    logger.debug(`Result: ${JSON.stringify(result)}`);

    // Verify
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.prompt, expectedPrompt);
      assertExists(result.variables.find((v) => v === "name"));
    }
  });

  await t.step("should handle missing template file", async () => {
    logger.debug("Testing prompt generation with missing template file");
    // Setup
    const templatePath = "tests/00_fixtures/01_templates/nonexistent.md";
    const variables = { name: "test" };

    // Execute
    const result = await promptManager.generatePrompt(templatePath, variables);
    logger.debug(`Result: ${JSON.stringify(result)}`);

    // Verify
    assertEquals(result.success, false);
    if (!result.success) {
      assertExists(result.error?.includes("Template not found"));
    }
  });

  await t.step("should handle invalid variables", async () => {
    logger.debug("Testing prompt generation with invalid variables");
    // Setup
    const templatePath = "tests/00_fixtures/01_templates/01_basic.md";
    const variables = { "invalid-name": "test" };

    // Execute
    const result = await promptManager.generatePrompt(templatePath, variables);
    logger.debug(`Result: ${JSON.stringify(result)}`);

    // Verify
    assertEquals(result.success, false);
    if (!result.success) {
      assertExists(result.error?.includes("Invalid variable name"));
    }
  });
});
