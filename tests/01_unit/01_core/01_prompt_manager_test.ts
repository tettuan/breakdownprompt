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

import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { FileUtils } from "../../../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { PathValidator as _PathValidator } from "../../../src/validation/path_validator.ts";
import type { VariableValidator as _VariableValidator } from "../../../src/validation/variable_validator.ts";
import { TextValidator } from "../../../src/validation/markdown_validator.ts";
import type {
  PromptErrorResult as _PromptErrorResult,
  PromptSuccessResult as _PromptSuccessResult,
} from "../../../src/types/prompt_result.ts";

const logger = new BreakdownLogger();
const textValidator = new TextValidator();
const fileUtils = new FileUtils();

// Pre-processing and Preparing Part
let promptManager: PromptManager;
const testTemplatePath = "tests/00_fixtures/01_templates/01_basic.md";
const testOutputPath = "tests/00_fixtures/02_output/test_output.md";

async function setupTest() {
  promptManager = new PromptManager(textValidator);
  // Ensure clean state
  await cleanupTest();
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
      await fileUtils.writeFile(testOutputPath, "");
    }
  } catch (_error) {
    // Ignore errors during cleanup
  }
}

// Main Test
Deno.test({
  name: "PromptManager - Basic prompt generation",
  async fn(t) {
    await setupTest();

    await t.step("should generate a prompt from a valid template file", async () => {
      logger.debug("Testing prompt generation with valid template file");
      const result = await promptManager.generatePrompt(
        testTemplatePath,
        { name: "test" },
      );
      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(result.prompt.includes("Hello, test!"), true);
        assertEquals(result.variables.includes("name"), true);
        assertEquals(result.unknownVariables?.length ?? 0, 0);
      }
    });

    await t.step("should handle missing template file", async () => {
      logger.debug("Testing prompt generation with missing template file");
      const result = await promptManager.generatePrompt(
        "tests/00_fixtures/01_templates/nonexistent.md",
        { name: "test" },
      );
      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(
          result.error,
          "Template not found: tests/00_fixtures/01_templates/nonexistent.md",
        );
      }
    });

    await t.step("should handle invalid variables", async () => {
      logger.debug("Testing prompt generation with invalid variables");
      const result = await promptManager.generatePrompt(
        testTemplatePath,
        { "invalid-name": "test" },
      );
      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(
          result.error,
          "Invalid variable name: invalid-name (variable names cannot contain hyphens)",
        );
      }
    });

    await cleanupTest();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
