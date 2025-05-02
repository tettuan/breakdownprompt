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

const _logger = new BreakdownLogger();
const textValidator = new TextValidator();

// Pre-processing and Preparing Part
// Setup: Initialize PromptManager and test data
let promptManager: PromptManager;

function setupTest() {
  promptManager = new PromptManager(textValidator);
}

// Main Test
Deno.test("should process complete flow", async () => {
  setupTest();
  const template = "# Hello {{name}}, you are {{age}} years old";
  const variables = { name: "test", age: "25" };
  const expectedOutput = "# Hello test, you are 25 years old";

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, expectedOutput);
  }
});

Deno.test("should maintain file structure", async () => {
  setupTest();
  const template = "tests/00_fixtures/01_templates/02_with_variables.md";
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

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertExists(result.prompt);
    assertEquals(typeof result.prompt, "string");
  }
});

Deno.test("should handle complex content", async () => {
  setupTest();
  const template = "tests/00_fixtures/01_templates/02_with_variables.md";
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

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertExists(result.prompt);
    assertEquals(typeof result.prompt, "string");
    assertEquals(result.prompt.includes("こんにちは"), true);
    assertEquals(result.prompt.includes("こんばんは"), true);
  }
});

Deno.test("should handle invalid input", async () => {
  setupTest();
  const template = "tests/00_fixtures/01_templates/nonexistent.md";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error, "Template not found: tests/00_fixtures/01_templates/nonexistent.md");
  }
});

Deno.test("should handle missing files", async () => {
  setupTest();
  const template = "tests/00_fixtures/01_templates/nonexistent.md";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error, "Template not found: tests/00_fixtures/01_templates/nonexistent.md");
  }
});

Deno.test("should handle invalid variables", async () => {
  setupTest();
  const template = "tests/00_fixtures/01_templates/02_with_variables.md";
  const variables = { "invalid-name": "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(
      result.error,
      "Invalid variable name: invalid-name (variable names cannot contain hyphens)",
    );
  }
});

Deno.test("should handle partial failures", async () => {
  setupTest();
  const template = "tests/00_fixtures/01_templates/02_with_variables.md";
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

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(
      result.error,
      "Invalid variable name: invalid-name (variable names cannot contain hyphens)",
    );
  }
});
