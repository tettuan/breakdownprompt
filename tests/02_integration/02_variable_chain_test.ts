/**
 * Variable Chain Integration Test
 *
 * Purpose:
 * - Verify the integration of variable replacement in a chain
 * - Validate variable dependencies and their resolution
 * - Ensure proper handling of variable chains in templates
 *
 * Intent:
 * - Test basic variable chain functionality
 * - Verify multi-level variable dependencies
 * - Test circular dependency detection
 * - Validate error handling in chains
 *
 * Expected Results:
 * - Variables are replaced correctly in chains
 * - Dependencies are resolved properly
 * - Circular dependencies are detected
 * - Error cases are handled appropriately
 *
 * Success Cases:
 * - Basic variable chain
 * - Multi-level dependencies
 * - Special character handling
 * - Empty chain handling
 *
 * Failure Cases:
 * - Circular dependencies
 * - Missing dependencies
 * - Invalid variable names
 * - Invalid variable values
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  type assertRejects as _assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { ValidationError as _ValidationError } from "../../src/errors.ts";
import { TextValidator } from "../../src/validation/markdown_validator.ts";
import type {
  PromptErrorResult as _PromptErrorResult,
  PromptSuccessResult as _PromptSuccessResult,
} from "../../src/types/prompt_result.ts";

const logger = new BreakdownLogger();
const textValidator = new TextValidator();

// Pre-processing and Preparing Part
// Setup: Initialize PromptManager and test data
let promptManager: PromptManager;

function setupTest() {
  promptManager = new PromptManager(textValidator, undefined, undefined, undefined, logger);
}

// Main Test
Deno.test("should process basic variable chain", async () => {
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

Deno.test("should handle multi-level dependencies", async () => {
  setupTest();
  const template = "## {{greeting}}, {{name}}! You are {{age}} years old";
  const variables = { greeting: "Hello", name: "test", age: "25" };
  const expectedOutput = "## Hello, test! You are 25 years old";

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, expectedOutput);
  }
});

Deno.test("should detect circular dependencies", async () => {
  setupTest();
  const template = "### {{a}} {{b}}";
  const variables = { a: "{{b}}", b: "{{a}}" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error, "Circular variable reference detected");
  }
});

Deno.test("should handle missing dependencies", async () => {
  setupTest();
  const template = "#### Hello {{name}}, you are {{age}} years old";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error, "Missing required variables: age");
  }
});

Deno.test("should handle invalid variable names", async () => {
  setupTest();
  const template = "##### Hello {{invalid-name}}";
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

Deno.test("should handle invalid variable values", async () => {
  setupTest();
  const template = "###### Age: {{age}}";
  const variables = { age: "" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error, "Invalid value for variable: age");
  }
});

Deno.test("should handle special characters in chains", async () => {
  setupTest();
  const template = "> {{greeting}}, {{name}}!";
  const variables = { greeting: "Hello, World!", name: "test" };
  const expectedOutput = "> Hello, World!, test!";

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, expectedOutput);
  }
});

Deno.test("should handle empty chain", async () => {
  setupTest();
  const template = "";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, false);
  if (!result.success) {
    assertEquals(result.error, "Template is empty");
  }
});

Deno.test("should handle template with no variables", async () => {
  setupTest();
  const template = "# Hello World";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, "# Hello World");
  }
});
