/**
 * PromptManager Tests
 *
 * Purpose:
 * - Verify the core functionality of the PromptManager class
 * - Ensure proper template loading
 * - Validate parameter handling and error cases
 *
 * Background:
 * The PromptManager is the main orchestrator of the prompt management system.
 * It handles template loading and coordination between PromptGenerator
 * and OutputController. These tests ensure it maintains system integrity and
 * follows the design specifications from docs/index.ja.md.
 *
 * Success Criteria:
 * 1. Initialization: Manager should be properly instantiated
 * 2. Parameter Validation: Invalid parameters should be caught early
 * 3. Template Loading: Templates should be loaded correctly
 * 4. Error Handling: Appropriate errors should be thrown for invalid cases
 * 5. Integration: Should work correctly with actual template and input files
 */

import { assert, assertRejects } from "@std/assert";
import { PromptManager } from "../src/prompt_manager.ts";
import type { PromptParams } from "../src/types.ts";
import {
  cleanupTestDirs,
  copyFixtureFiles,
  setupTestDirs,
  TEST_CONFIG,
  TEST_PARAMS,
} from "./test_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

// Test initialization with valid configuration
Deno.test("PromptManager - initialization", () => {
  logger.info("Starting PromptManager Initialization Test");
  const manager = new PromptManager();
  logger.debug("Manager instance created");

  assert(manager instanceof PromptManager, "Manager should be an instance of PromptManager");
  logger.debug("Instance type verification passed", { isInstance: true });

  logger.info("PromptManager Initialization Test completed");
});

// Test parameter validation to ensure system integrity
Deno.test("PromptManager - parameter validation", async () => {
  logger.info("Starting PromptManager Parameter Validation Test");

  const manager = new PromptManager();
  logger.debug("Manager instance created");

  const invalidParams: PromptParams = {
    prompt_file_path: "",
    destination: TEST_PARAMS.DESTINATION,
    multipleFiles: TEST_PARAMS.MULTIPLE_FILES,
    structured: TEST_PARAMS.STRUCTURED,
  };
  logger.debug("Invalid Parameters", invalidParams);

  await assertRejects(
    async () => {
      logger.debug("Attempting to generate prompt with invalid params", { params: invalidParams });
      await manager.generatePrompt(invalidParams);
    },
    Error,
    "Prompt file path is required",
  );
  logger.debug("Expected error was thrown", { errorMessage: "Prompt file path is required" });

  logger.info("PromptManager Parameter Validation Test completed");
});

// Test template loading and error handling
Deno.test("PromptManager - template loading", async () => {
  logger.info("Starting PromptManager Template Loading Test");

  await setupTestDirs();
  logger.debug("Test directories setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager();
  logger.debug("Manager instance created");

  const params: PromptParams = {
    prompt_file_path: TEST_PARAMS.PROMPT_FILE_PATH,
    destination: TEST_PARAMS.DESTINATION,
    multipleFiles: TEST_PARAMS.MULTIPLE_FILES,
    structured: TEST_PARAMS.STRUCTURED,
  };
  logger.debug("Test Parameters", params);

  await assertRejects(
    async () => {
      logger.debug("Attempting to generate prompt with missing template", { params });
      await manager.generatePrompt(params);
    },
    Error,
    "Failed to load template",
  );
  logger.debug("Expected template loading error was thrown", {
    errorMessage: "Failed to load template",
  });

  await cleanupTestDirs();
  logger.debug("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  logger.info("PromptManager Template Loading Test completed");
});

// Test integration with actual template and input files
Deno.test("PromptManager - integration with fixtures", async () => {
  logger.info("Starting PromptManager Integration Test");

  await setupTestDirs();
  logger.debug("Test directories setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  await copyFixtureFiles();
  logger.debug("Fixture files copied", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager();
  logger.debug("Manager instance created");

  const params: PromptParams = {
    prompt_file_path: TEST_PARAMS.PROMPT_FILE_PATH,
    destination: TEST_PARAMS.DESTINATION,
    multipleFiles: TEST_PARAMS.MULTIPLE_FILES,
    structured: TEST_PARAMS.STRUCTURED,
  };
  logger.debug("Test Parameters", { params });

  logger.debug("Generating prompt with valid parameters", { params });
  const result = await manager.generatePrompt(params);
  logger.debug("Generated Result", { result });

  // Verify the content was processed correctly
  assert(result.content !== undefined, "Result should have content");

  // Verify the prompt content after variable replacement
  assert(result.content.includes("Input"), "Result should contain input section");
  assert(result.content.includes("Schema"), "Result should contain schema section");
  assert(
    result.content.includes("Output Location"),
    "Result should contain output location section",
  );

  await cleanupTestDirs();
  logger.debug("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  logger.info("PromptManager Integration Test completed");
});

// Test variable replacement errors
Deno.test("PromptManager - variable replacement errors", async () => {
  logger.info("Starting Variable Replacement Error Test");

  await setupTestDirs();
  logger.debug("Test directories setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  await copyFixtureFiles();
  logger.debug("Fixture files copied", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager();
  logger.debug("Manager instance created");

  const params: PromptParams = {
    prompt_file_path: TEST_PARAMS.PROMPT_FILE_PATH,
    destination: TEST_PARAMS.DESTINATION,
    multipleFiles: TEST_PARAMS.MULTIPLE_FILES,
    structured: TEST_PARAMS.STRUCTURED,
  };
  logger.debug("Test Parameters", { params });

  // Test with invalid variable
  const invalidTemplate = "Test with {invalid_variable}";
  const invalidTemplatePath = `${TEST_CONFIG.BASE_DIR}/templates/invalid_template.md`;
  await Deno.writeTextFile(invalidTemplatePath, invalidTemplate);

  const invalidParams = { ...params };
  invalidParams.prompt_file_path = invalidTemplatePath;

  await assertRejects(
    async () => {
      logger.debug("Attempting to generate prompt with invalid template", {
        params: invalidParams,
      });
      await manager.generatePrompt(invalidParams);
    },
    Error,
    "Unknown variable: invalid_variable",
  );
  logger.debug("Expected template loading error was thrown", {
    errorMessage: "Unknown variable: invalid_variable",
  });

  await cleanupTestDirs();
  logger.debug("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  logger.info("Variable Replacement Error Test completed");
});

// Test comprehensive prompt processing
Deno.test("PromptManager - comprehensive prompt processing", async () => {
  logger.info("Starting Comprehensive Prompt Processing Test");

  await setupTestDirs();
  logger.debug("Test directories setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  await copyFixtureFiles();
  logger.debug("Fixture files copied", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager();
  logger.debug("Manager instance created");

  const params: PromptParams = {
    prompt_file_path: TEST_PARAMS.PROMPT_FILE_PATH,
    destination: TEST_PARAMS.DESTINATION,
    multipleFiles: TEST_PARAMS.MULTIPLE_FILES,
    structured: TEST_PARAMS.STRUCTURED,
  };
  logger.debug("Test Parameters", { params });

  logger.debug("Generating prompt with comprehensive parameters", { params });
  const result = await manager.generatePrompt(params);
  logger.debug("Generated Result", { result });

  // Verify the content was processed correctly
  assert(result.content !== undefined, "Result should have content");

  // Verify the structure matches the template format
  const sections = result.content.split(/(?=\n## )/);
  const sectionHeaders = sections.map((s) => s.trim().split("\n")[0]);
  logger.debug("Section headers:", { sectionHeaders });

  // Verify all required sections are present
  assert(sectionHeaders.some((h) => h.startsWith("## Schema")), "Should contain Schema heading");
  assert(sectionHeaders.some((h) => h.startsWith("## Input")), "Should contain Input heading");
  assert(
    sectionHeaders.some((h) => h.startsWith("## Output Location")),
    "Should contain Output Location heading",
  );

  await cleanupTestDirs();
  logger.debug("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  logger.info("Comprehensive Prompt Processing Test completed");
});
