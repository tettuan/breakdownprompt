/**
 * Variable Edge Cases System Test
 *
 * Purpose:
 * - Verify the system behavior with various combinations of reserved and template variables
 * - Validate the handling of edge cases in the class hierarchy
 * - Ensure proper processing of common and specific variable behaviors
 *
 * Scope:
 * - Test combinations of base class and concrete class variables
 * - Verify edge cases in common processing flow
 * - Test class hierarchy relationships in edge cases
 * - Validate error handling in edge cases
 *
 * Test Cases:
 * - Base class edge cases
 *   - Empty variable handling
 *   - Null/undefined value handling
 *   - Common method edge cases
 * - Concrete class edge cases
 *   - Specific validation edge cases
 *   - Specific conversion edge cases
 *   - Error handling edge cases
 * - Class hierarchy edge cases
 *   - Inheritance edge cases
 *   - Polymorphism edge cases
 * - Processing flow edge cases
 *   - Common processing edge cases
 *   - Specific processing edge cases
 *
 * Expected Behavior:
 * - Base class edge cases are handled correctly
 * - Concrete class edge cases are handled correctly
 * - Class hierarchy edge cases are handled correctly
 * - Processing flow edge cases are handled correctly
 *
 * Error Cases:
 * - Invalid base class edge cases
 * - Invalid concrete class edge cases
 * - Invalid class hierarchy edge cases
 * - Invalid processing flow edge cases
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
Deno.test("Variable Edge Cases", async (t) => {
  await t.step("should handle zero reserved and zero template variables", async () => {
    setupTest();
    const template = "Hello World!";
    const variables = {};

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello World!");
    }
  });

  await t.step("should handle zero reserved and one template variable", async () => {
    setupTest();
    const template = "Hello {name}!";
    const variables = {};

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello {name}!");
    }
  });

  await t.step("should handle one reserved and zero template variables", async () => {
    setupTest();
    const template = "Hello World!";
    const variables = { name: "test" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello World!");
    }
  });

  await t.step("should handle one reserved and one template variable (match)", async () => {
    setupTest();
    const template = "Hello {name}!";
    const variables = { name: "test" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello test!");
    }
  });

  await t.step("should handle one reserved and one template variable (mismatch)", async () => {
    setupTest();
    const template = "Hello {name}!";
    const variables = { age: "25" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello {name}!");
    }
  });

  await t.step("should handle multiple variables with one missing", async () => {
    setupTest();
    const template = "Hello {name}! Your age is {age}.";
    const variables = { name: "test" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello test! Your age is {age}.");
    }
  });

  await t.step("should handle multiple variables with all present", async () => {
    setupTest();
    const template = "Hello {name}! Your age is {age}.";
    const variables = { name: "test", age: "25" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello test! Your age is 25.");
    }
  });

  await t.step("should handle multiple variables with all missing", async () => {
    setupTest();
    const template = "Hello {name}! Your age is {age}.";
    const variables = {};

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, "Hello {name}! Your age is {age}.");
    }
  });

  await t.step("should handle empty variable names", async () => {
    setupTest();
    const template = "Hello {}!";
    const variables = { "": "test" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, false);
  });

  await t.step("should handle special characters in variable names", async () => {
    setupTest();
    const template = "Hello {name-with-hyphen}!";
    const variables = { "name-with-hyphen": "test" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, false);
  });

  await t.step("should handle long variable names", async () => {
    setupTest();
    const longName = "a".repeat(1000);
    const template = `Hello {${longName}}!`;
    const variables = { [longName]: "test" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Hello test!");
    }
  });

  await t.step("should handle empty variable values", async () => {
    setupTest();
    const template = "Hello {name}!";
    const variables = { name: "" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Hello {name}!");
    }
  });

  await t.step("should handle long variable values", async () => {
    setupTest();
    const longValue = "a".repeat(1000);
    const template = `Hello {name}!`;
    const variables = { name: longValue };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success && result.content) {
      assertEquals(result.content, `Hello ${longValue}!`);
    }
  });

  await t.step("should handle special characters in variable values", async () => {
    setupTest();
    const template = "Message: {message}";
    const variables = { message: "Hello, World! @#$%" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Message: Hello, World! @#$%");
    }
  });

  await t.step("should handle newlines in variable values", async () => {
    setupTest();
    const template = "Message: {message}";
    const variables = { message: "Hello\nWorld!" };

    const result = await promptManager.generatePrompt(template, variables);
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Message: Hello\nWorld!");
    }
  });
});
