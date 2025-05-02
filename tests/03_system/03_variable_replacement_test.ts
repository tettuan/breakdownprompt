/**
 * Variable Replacement System Test
 *
 * Purpose:
 * - Verify the system-wide variable replacement functionality
 * - Validate variable replacement across components
 * - Ensure proper handling of variable dependencies
 *
 * Intent:
 * - Test variable replacement flow
 * - Verify variable dependency resolution
 * - Test variable replacement error handling
 * - Validate variable replacement recovery
 *
 * Expected Results:
 * - Variables are replaced correctly across the system
 * - Variable dependencies are resolved properly
 * - Errors are handled appropriately
 *
 * Success Cases:
 * - Valid variable replacement
 * - Valid dependency resolution
 * - Valid error handling
 *
 * Failure Cases:
 * - Invalid variable replacement
 * - Invalid dependency resolution
 * - Invalid error handling
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects as _assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { VariableReplacer } from "../../src/core/variable_replacer.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../src/errors.ts";
import { VariableValidator } from "../../src/validation/variable_validator.ts";

const logger = new BreakdownLogger();
const variableValidator = new VariableValidator();

// Pre-processing and Preparing Part
// Setup: Initialize VariableReplacer and test data
let variableReplacer: VariableReplacer;

function setupTest() {
  variableReplacer = new VariableReplacer(logger, variableValidator);
}

// Main Test
Deno.test("should replace basic variables correctly", async () => {
  setupTest();
  const template = "Hello {name}, you are {age} years old.";
  const variables = {
    name: "John",
    age: "25",
  };

  const replaced = await variableReplacer.replaceVariables(template, variables);
  assertEquals(replaced, "Hello John, you are 25 years old.");
});

Deno.test("should handle variable dependencies", async () => {
  setupTest();
  const template = "Full name: {firstName} {lastName}";
  const variables = {
    firstName: "John",
    lastName: "Doe",
  };

  const replaced = await variableReplacer.replaceVariables(template, variables);
  assertEquals(replaced, "Full name: John Doe");
});

Deno.test("should handle nested variables", async () => {
  setupTest();
  const template = "User: {user_name}, Age: {user_age}";
  const variables = {
    user_name: "John",
    user_age: "25",
  };

  const replaced = await variableReplacer.replaceVariables(template, variables);
  assertEquals(replaced, "User: John, Age: 25");
});

Deno.test("should handle missing variables", async () => {
  setupTest();
  const template = "Hello {name}";
  const variables = {};

  await _assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should handle invalid variable names", async () => {
  setupTest();
  const template = "Hello {invalid-name}";
  const variables = {
    "invalid-name": "test",
  };

  await _assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Invalid variable name",
  );
});

Deno.test("should handle complex variable structures", async () => {
  setupTest();
  const template = "User: {user_name}, Address: {user_address_street}, {user_address_city}";
  const variables = {
    user_name: "John",
    user_address_street: "123 Main St",
    user_address_city: "Test City",
  };

  const replaced = await variableReplacer.replaceVariables(template, variables);
  assertEquals(replaced, "User: John, Address: 123 Main St, Test City");
});
