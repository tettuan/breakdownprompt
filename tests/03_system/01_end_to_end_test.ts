/**
 * End-to-End System Test
 *
 * Purpose:
 * - Verify the complete system functionality from input to output
 * - Validate the entire processing flow
 * - Ensure proper error handling and recovery
 *
 * Intent:
 * - Test complete processing flow
 * - Verify file structure maintenance
 * - Test complex content handling
 * - Validate error recovery
 *
 * Expected Results:
 * - Complete processing flow works correctly
 * - File structure is maintained
 * - Complex content is handled properly
 * - Error cases are handled appropriately
 *
 * Success Cases:
 * - Complete processing flow
 * - File structure maintenance
 * - Complex content handling
 * - Error recovery
 *
 * Failure Cases:
 * - Invalid input
 * - Missing files
 * - Invalid variables
 * - Partial failures
 */

import {
  assertEquals,
  assertExists,
  type assertRejects as _assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { ValidationError as _ValidationError } from "../../src/errors.ts";
import { TextValidator } from "../../src/validation/markdown_validator.ts";
import { FileUtils } from "../../src/utils/file_utils.ts";

const logger = new BreakdownLogger();
const textValidator = new TextValidator();
const fileUtils = new FileUtils();

// Pre-processing and Preparing Part
let promptManager: PromptManager;
const testTemplatePath = "tests/00_fixtures/01_templates/02_with_variables.md";
const testOutputPath = "tests/00_fixtures/02_output/test_output.md";

async function setupTest() {
  promptManager = new PromptManager(textValidator);
  // Create test output directory if it doesn't exist
  try {
    await Deno.mkdir("tests/00_fixtures/02_output", { recursive: true });
  } catch (_error) {
    // Ignore if directory already exists
  }
}

async function cleanupTest() {
  try {
    const exists = await fileUtils.exists(testOutputPath);
    if (exists) {
      await Deno.remove(testOutputPath);
    }
  } catch (_error) {
    // Ignore if file doesn't exist
  }
}

// Main Test
Deno.test({
  name: "End-to-End System Test",
  async fn(t) {
    await setupTest();

    await t.step("should process complete flow with direct template", async () => {
      logger.debug("Testing complete flow with direct template");
      const template = "# Hello {name}, you are {age} years old";
      const variables = { name: "test", age: "25" };
      const expectedOutput = "# Hello test, you are 25 years old";

      const result = await promptManager.generatePrompt(template, variables);
      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(result.prompt, expectedOutput);
      }
    });

    await t.step("should process complete flow with file template", async () => {
      logger.debug("Testing complete flow with file template");
      const variables = {
        greeting: "こんにちは",
        name: "テスト",
        weather: "晴れ",
        temperature: "25",
        condition: "true",
        variable1: "テスト変数1",
        variable2: "テスト変数2",
        variable3: "テスト変数3",
      };

      const result = await promptManager.generatePrompt(testTemplatePath, variables);
      assertEquals(result.success, true);
      if (result.success) {
        assertExists(result.prompt);
        assertEquals(typeof result.prompt, "string");
        // Verify basic variables are replaced
        const basicVariables = {
          greeting: "こんにちは",
          name: "テスト",
          weather: "晴れ",
          temperature: "25",
          variable1: "テスト変数1",
          variable2: "テスト変数2",
          variable3: "テスト変数3",
        };
        Object.entries(basicVariables).forEach(([key, value]) => {
          assertEquals(
            result.prompt.includes(value),
            true,
            `Variable ${key} not replaced correctly`,
          );
        });
        // Verify conditional text appears when condition is true
        assertEquals(
          result.prompt.includes("条件が真の場合に表示されるテキスト"),
          true,
          "Conditional text not shown when condition is true",
        );
      }
    });

    await t.step("should handle complex content with newlines", async () => {
      logger.debug("Testing complex content with newlines");
      const variables = {
        greeting: "こんにちは\nこんばんは",
        name: "テスト",
        weather: "晴れ",
        temperature: "25",
        condition: "true",
        variable1: "テスト変数1",
        variable2: "テスト変数2",
        variable3: "テスト変数3",
      };

      const result = await promptManager.generatePrompt(testTemplatePath, variables);
      assertEquals(result.success, true);
      if (result.success) {
        assertExists(result.prompt);
        assertEquals(typeof result.prompt, "string");
        assertEquals(result.prompt.includes("こんにちは"), true);
        assertEquals(result.prompt.includes("こんばんは"), true);
      }
    });

    await t.step("should handle invalid template path", async () => {
      logger.debug("Testing invalid template path");
      const template = "tests/00_fixtures/01_templates/nonexistent.md";
      const variables = { name: "test" };

      const result = await promptManager.generatePrompt(template, variables);
      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(
          result.error,
          "Template not found: tests/00_fixtures/01_templates/nonexistent.md",
        );
      }
    });

    await t.step("should handle invalid variable names", async () => {
      logger.debug("Testing invalid variable names");
      const variables = { "invalid-name": "test" };

      const result = await promptManager.generatePrompt(testTemplatePath, variables);
      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(
          result.error,
          "Invalid variable name: invalid-name (variable names cannot contain hyphens)",
        );
      }
    });

    await t.step(
      "should handle partial failures with mixed valid and invalid variables",
      async () => {
        logger.debug("Testing partial failures");
        const variables = {
          greeting: "こんにちは",
          name: "テスト",
          weather: "晴れ",
          temperature: "25",
          condition: "true",
          variable1: "テスト変数1",
          variable2: "テスト変数2",
          variable3: "テスト変数3",
          "invalid-name": "test",
        };

        const result = await promptManager.generatePrompt(testTemplatePath, variables);
        assertEquals(result.success, false);
        if (!result.success) {
          assertEquals(
            result.error,
            "Invalid variable name: invalid-name (variable names cannot contain hyphens)",
          );
        }
      },
    );

    await cleanupTest();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
