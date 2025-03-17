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

import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { PromptManager } from "../src/prompt_manager.ts";
import { DefaultConfig } from "../src/config.ts";
import { PromptParams } from "../src/types.ts";
import { TEST_CONFIG, TEST_PARAMS, setupTestDirs, cleanupTestDirs, copyFixtureFiles, readFixtureContent } from "./test_utils.ts";

// Test initialization with valid configuration
Deno.test("PromptManager - initialization", () => {
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
  assertEquals(manager instanceof PromptManager, true);
});

// Test parameter validation to ensure system integrity
Deno.test("PromptManager - parameter validation", async () => {
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
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

  await assertThrows(
    async () => {
      await manager.generatePrompt(invalidParams);
    },
    Error,
    "Demonstrative type is required",
  );
});

// Test template loading and error handling
Deno.test("PromptManager - template loading", async () => {
  await setupTestDirs();
  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
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

  await assertThrows(
    async () => {
      await manager.generatePrompt(params);
    },
    Error,
    "Failed to load template",
  );

  await cleanupTestDirs();
});

// Test integration with actual template and input files
Deno.test("PromptManager - integration with fixtures", async () => {
  await setupTestDirs();
  await copyFixtureFiles();

  const manager = new PromptManager(TEST_CONFIG.BASE_DIR, new DefaultConfig());
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

  const result = await manager.generatePrompt(params);
  
  // Verify the content was processed correctly
  assertEquals(result.content.includes("Implementation from Design"), true);
  assertEquals(result.content.includes(TEST_CONFIG.BASE_DIR), true);
  assertEquals(result.metadata.variables.size > 0, true);

  await cleanupTestDirs();
}); 