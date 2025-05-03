/**
 * Variable Replacement System Test
 *
 * Purpose:
 * - Verify the end-to-end variable replacement functionality
 * - Test the interaction between reserved variables and template variables
 * - Ensure proper handling of variable relationships in the replacement process
 *
 * Intent:
 * - Test variable replacement process
 *   - Reserved variable replacement
 *   - Template variable replacement
 *   - Variable chain replacement
 * - Test variable relationships
 *   - Reserved variable and template variable interaction
 *   - Variable chain interaction
 *   - Missing variable handling
 * - Test error handling in replacement
 *   - Invalid variable handling
 *   - Type mismatch handling
 *   - Missing variable handling
 *
 * Scope:
 * - Variable replacement
 *   - Reserved variable replacement
 *   - Template variable replacement
 *   - Variable chain replacement
 * - Variable relationships
 *   - Reserved variable and template variable interaction
 *   - Variable chain interaction
 *   - Missing variable handling
 * - Error handling
 *   - Replacement error handling
 *   - Relationship error handling
 *   - Chain error handling
 *
 * Notes:
 * - All reserved variables are optional
 * - Error messages should be consistent with validation rules
 * - Type validation is strict and follows predefined rules
 */

import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { TextValidator } from "../../src/validation/markdown_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();
const textValidator = new TextValidator();

// Pre-processing and Preparing Part
let promptManager: PromptManager;

function setupTest() {
  promptManager = new PromptManager(textValidator, undefined, undefined, undefined, logger);
}

// Main Test
Deno.test("should replace basic variables correctly", async () => {
  setupTest();
  const template = "Hello {name}!";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, "Hello test!");
  }
});

Deno.test("should handle variable dependencies", async () => {
  setupTest();
  const template = "{greeting}, {name}!";
  const variables = { greeting: "Hello", name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, "Hello, test!");
  }
});

Deno.test("should handle nested variables", async () => {
  setupTest();
  const template = "{message}";
  const variables = {
    name: "test",
    greeting: "Hello {name}",
    message: "{greeting}!",
  };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, "{greeting}!");
  }
});

Deno.test("should handle missing variables", async () => {
  setupTest();
  const template = "Hello {name}! Your age is {age}.";
  const variables = { name: "test" };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, "Hello test! Your age is {age}.");
  }
});

Deno.test("should handle invalid variable names", async () => {
  setupTest();
  const template = "Hello {invalid-name}!";
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

Deno.test("should handle complex variable structures", async () => {
  setupTest();
  const template = "{greeting}, {name}! {message}";
  const variables = {
    name: "test",
    greeting: "Hello",
    message: "How are you?",
  };

  const result = await promptManager.generatePrompt(template, variables);
  assertEquals(result.success, true);
  if (result.success) {
    assertEquals(result.prompt, "Hello, test! How are you?");
  }
});
