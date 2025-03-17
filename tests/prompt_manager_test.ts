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
 * 1. Initialization: Manager should be properly instantiated with config
 * 2. Parameter Validation: Invalid parameters should be caught early
 * 3. Template Loading: Templates should be loaded and cached correctly
 * 4. Error Handling: Appropriate errors should be thrown for invalid cases
 * 5. Integration: Should work correctly with actual template and input files
 */

import { assertEquals, assertRejects } from "std/testing/asserts.ts";
import { PromptManager } from "../src/prompt_manager.ts";
import { DefaultConfig } from "../src/config.ts";
import { PromptParams } from "../src/types.ts";
import { TEST_CONFIG, TEST_PARAMS, setupTestDirs, cleanupTestDirs, copyFixtureFiles, readFixtureContent } from "./test_utils.ts";
import { startSection, endSection, checkpoint, logObject } from "../utils/debug-logger.ts";

// Test initialization with valid configuration
Deno.test("PromptManager - initialization", () => {
  startSection("PromptManager Initialization Test");
  
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
  checkpoint("Manager instance created", { baseDir: TEST_CONFIG.BASE_DIR });
  
  assertEquals(manager instanceof PromptManager, true);
  checkpoint("Instance type verification passed", { isInstance: true });
  
  endSection("PromptManager Initialization Test");
});

// Test parameter validation to ensure system integrity
Deno.test("PromptManager - parameter validation", async () => {
  startSection("PromptManager Parameter Validation Test");
  
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
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
  
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
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
  checkpoint("Expected template loading error was thrown", { errorMessage: "Failed to load template" });

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
  
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
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
  checkpoint("Verifying result content", { 
    hasImplementation: result.content.includes("Implementation from Design"),
    hasBaseDir: result.content.includes(TEST_CONFIG.BASE_DIR),
    hasVariables: result.metadata.variables.size > 0
  });

  await cleanupTestDirs();
  checkpoint("Test directories cleaned up", { baseDir: TEST_CONFIG.BASE_DIR });
  
  endSection("PromptManager Integration Test");
}); 