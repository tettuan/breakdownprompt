/**
 * PromptManager Tests
 *
 * Purpose:
 * - Verify the core functionality of the PromptManager class
 * - Ensure proper template loading and caching
 * - Validate parameter handling and error cases
 *
 * Background:
 * The PromptManager is the main orchestrator of the prompt management system.
 * It handles template loading, caching, and coordination between PromptGenerator
 * and OutputController. These tests ensure it maintains system integrity and
 * follows the design specifications from docs/design_pattern.ja.md.
 *
 * Success Criteria:
 * 1. Initialization: Manager should be properly instantiated
 * 2. Parameter Validation: Invalid parameters should be caught early
 * 3. Template Loading: Templates should be loaded and cached correctly
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
import { checkpoint, endSection, logObject, startSection } from "../utils/debug-logger.ts";
import { logger } from "../utils/logger.ts";

// Test initialization with valid configuration
Deno.test("PromptManager - initialization", () => {
  startSection("PromptManager Initialization Test");

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR);
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });

  assert(manager instanceof PromptManager, "Manager should be an instance of PromptManager");
  checkpoint("Instance type verification passed", { isInstance: true });

  endSection("PromptManager Initialization Test");
});

// Test parameter validation to ensure system integrity
Deno.test("PromptManager - parameter validation", async () => {
  startSection("PromptManager Parameter Validation Test");

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR);
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });

  const invalidParams: PromptParams = {
    demonstrativeType: "",
    layerType: TEST_PARAMS.LAYER_TYPE,
    fromLayerType: TEST_PARAMS.FROM_LAYER_TYPE,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
    validate() {
      return true;
    },
  };
  logObject(invalidParams, "Invalid Parameters");

  await assertRejects(
    async () => {
      checkpoint("Attempting to generate prompt with invalid params", { params: invalidParams });
      await manager.generatePrompt(invalidParams);
    },
    Error,
    "Demonstrative type is required",
  );
  checkpoint("Expected error was thrown", { errorMessage: "Demonstrative type is required" });

  endSection("PromptManager Parameter Validation Test");
});

// Test template loading and error handling
Deno.test("PromptManager - template loading", async () => {
  startSection("PromptManager Template Loading Test");

  await setupTestDirs();
  checkpoint("Test directories setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR);
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });

  const params: PromptParams = {
    demonstrativeType: TEST_PARAMS.DEMONSTRATIVE_TYPE,
    layerType: TEST_PARAMS.LAYER_TYPE,
    fromLayerType: TEST_PARAMS.FROM_LAYER_TYPE,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
    validate() {
      return true;
    },
  };
  logObject(params, "Test Parameters");

  await assertRejects(
    async () => {
      checkpoint("Attempting to generate prompt with missing template", { params });
      await manager.generatePrompt(params);
    },
    Error,
    "Failed to load template",
  );
  checkpoint("Expected template loading error was thrown", {
    errorMessage: "Failed to load template",
  });

  await cleanupTestDirs();
  checkpoint("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  endSection("PromptManager Template Loading Test");
});

// Test integration with actual template and input files
Deno.test("PromptManager - integration with fixtures", async () => {
  startSection("PromptManager Integration Test");

  await setupTestDirs();
  checkpoint("Test directories setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  await copyFixtureFiles();
  checkpoint("Fixture files copied", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR);
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });

  const params: PromptParams = {
    demonstrativeType: TEST_PARAMS.DEMONSTRATIVE_TYPE,
    layerType: TEST_PARAMS.LAYER_TYPE,
    fromLayerType: TEST_PARAMS.FROM_LAYER_TYPE,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
    validate() {
      return true;
    },
  };
  logObject(params, "Test Parameters");

  checkpoint("Generating prompt with valid parameters", { params });
  const result = await manager.generatePrompt(params);
  logObject(result, "Generated Result");

  // Verify the content was processed correctly
  assert(result.content !== undefined, "Result should have content");
  assert(result.metadata !== undefined, "Result should have metadata");
  assert(result.metadata.template !== undefined, "Result should have template in metadata");
  assert(result.metadata.variables !== undefined, "Result should have variables in metadata");
  assert(result.metadata.timestamp !== undefined, "Result should have timestamp in metadata");

  // Verify the prompt content after variable replacement
  assert(
    result.content.includes(TEST_PARAMS.DEMONSTRATIVE_TYPE),
    "Result should contain demonstrative type",
  );
  assert(result.content.includes(TEST_PARAMS.LAYER_TYPE), "Result should contain layer type");
  assert(
    result.content.includes(TEST_PARAMS.FROM_LAYER_TYPE),
    "Result should contain from layer type",
  );
  assert(
    result.content.includes("Implementation from Design"),
    "Result should contain implementation section",
  );
  assert(result.content.includes("Schema"), "Result should contain schema section");
  assert(result.content.includes("Input"), "Result should contain input section");
  assert(result.content.includes("Output"), "Result should contain output section");
  assert(
    result.content.includes("Additional Context"),
    "Result should contain additional context section",
  );

  // Verify the structure matches the template format
  const sections = result.content.split(/(?=\n## )/);
  console.debug("Sections:", sections);

  const sectionHeaders = sections.map((s) => s.trim().split("\n")[0]);
  console.debug("Section headers:", sectionHeaders);
  assert(sectionHeaders.some((h) => h.startsWith("## Schema")), "Should contain Schema heading");
  assert(sectionHeaders.some((h) => h.startsWith("## Input")), "Should contain Input heading");
  assert(sectionHeaders.some((h) => h.startsWith("## Output")), "Should contain Output heading");
  assert(
    sectionHeaders.some((h) => h.startsWith("## Additional Context")),
    "Should contain Additional Context heading",
  );

  // Verify variable replacements
  const schemaSection = sections.find((s) => s.includes("## Schema"));
  console.debug("Schema section:", schemaSection);
  assert(schemaSection !== undefined, "Schema section should exist");
  const expectedSchemaPath = `${TEST_CONFIG.BASE_DIR}/schema/${TEST_PARAMS.LAYER_TYPE}.json`;
  const schemaContent = schemaSection.split("\n").filter((line) => line.trim() !== "").slice(1)[0];
  console.debug("Schema content:", schemaContent);
  assert(
    schemaContent === expectedSchemaPath,
    `Schema section should contain correct schema file path. Expected: ${expectedSchemaPath}, Actual: ${schemaContent}`,
  );

  const inputSection = sections.find((s) => s.includes("## Input"));
  console.debug("Input section:", inputSection);
  assert(inputSection !== undefined, "Input section should exist");
  const expectedInputPath = `${TEST_CONFIG.BASE_DIR}/input/${TEST_PARAMS.FROM_LAYER_TYPE}.md`;
  const inputContent = inputSection.split("\n").filter((line) => line.trim() !== "").slice(1)[0];
  console.debug("Input content:", inputContent);
  assert(
    inputContent === expectedInputPath,
    `Input section should contain correct input file path. Expected: ${expectedInputPath}, Actual: ${inputContent}`,
  );

  const outputSection = sections.find((s) => s.includes("## Output"));
  assert(outputSection !== undefined, "Output section should exist");
  assert(
    outputSection.includes(TEST_CONFIG.OUTPUT_DIR),
    "Output section should contain correct destination path",
  );

  // Verify metadata
  assert(result.metadata.template !== undefined, "Result should have template in metadata");
  assert(result.metadata.variables !== undefined, "Result should have variables in metadata");
  assert(result.metadata.timestamp !== undefined, "Result should have timestamp in metadata");

  // Verify all variables are replaced
  const variables = result.metadata.variables;
  for (const [varName, originalValue] of variables) {
    assert(
      !result.content.includes(originalValue),
      `Variable ${varName} should be replaced in content`,
    );
  }

  // Log the final content for debugging
  logger.debug("Final prompt content:", result.content);

  await cleanupTestDirs();
  checkpoint("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  endSection("PromptManager Integration Test");
});

// Test variable replacement errors
Deno.test("PromptManager - variable replacement errors", async () => {
  startSection("Variable Replacement Error Test");

  await setupTestDirs();
  await copyFixtureFiles();
  checkpoint("Test directories and fixtures setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR);
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });

  // Create template with invalid variable
  const invalidTemplate = "Test with {invalid_variable}";
  await Deno.writeTextFile(
    `${TEST_CONFIG.BASE_DIR}/${TEST_PARAMS.DEMONSTRATIVE_TYPE}/${TEST_PARAMS.LAYER_TYPE}/f_${TEST_PARAMS.FROM_LAYER_TYPE}.md`,
    invalidTemplate,
  );
  checkpoint("Created template with invalid variable", { template: invalidTemplate });

  const params: PromptParams = {
    demonstrativeType: TEST_PARAMS.DEMONSTRATIVE_TYPE,
    layerType: TEST_PARAMS.LAYER_TYPE,
    fromLayerType: TEST_PARAMS.FROM_LAYER_TYPE,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
    validate() {
      return true;
    },
  };
  logObject(params, "Test Parameters");

  // Should not throw error, just log info
  const result = await manager.generatePrompt(params);
  checkpoint("Generated prompt with invalid variable", { result });

  // Verify the content remains unchanged
  assert(
    result.content.includes("{invalid_variable}"),
    "Invalid variable should remain in content",
  );

  // Verify metadata contains the invalid variable
  assert(
    result.metadata.variables.has("invalid_variable"),
    "Invalid variable should be in metadata",
  );

  await cleanupTestDirs();
  checkpoint("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  endSection("Variable Replacement Error Test");
});

// Test comprehensive prompt file processing
Deno.test("PromptManager - comprehensive prompt processing", async () => {
  startSection("Comprehensive Prompt Processing Test");

  await setupTestDirs();
  await copyFixtureFiles();
  checkpoint("Test directories and fixtures setup completed", { baseDir: TEST_CONFIG.BASE_DIR });

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR);
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });

  const params: PromptParams = {
    demonstrativeType: TEST_PARAMS.DEMONSTRATIVE_TYPE,
    layerType: TEST_PARAMS.LAYER_TYPE,
    fromLayerType: TEST_PARAMS.FROM_LAYER_TYPE,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
    validate() {
      return true;
    },
  };
  logObject(params, "Test Parameters");

  checkpoint("Generating prompt with test parameters", { params });
  const result = await manager.generatePrompt(params);
  logObject(result, "Generated Result");

  // Verify template structure
  const sections = result.content.split(/(?=\n## )/);
  assert(sections.length >= 4, "Result should have at least 4 major sections");

  // Verify main heading
  const mainHeading = sections[0];
  assert(mainHeading.startsWith("# "), "First section should be a main heading");
  assert(
    mainHeading.includes("Implementation from Design"),
    "Main heading should be 'Implementation from Design'",
  );

  // Verify section headers and content
  const sectionHeaders = sections.map((s) => s.trim().split("\n")[0]);
  console.debug("Section headers:", sectionHeaders);
  assert(sectionHeaders.some((h) => h.startsWith("## Schema")), "Should contain Schema heading");
  assert(sectionHeaders.some((h) => h.startsWith("## Input")), "Should contain Input heading");
  assert(sectionHeaders.some((h) => h.startsWith("## Output")), "Should contain Output heading");

  await cleanupTestDirs();
  checkpoint("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });

  endSection("Comprehensive Prompt Processing Test");
});
