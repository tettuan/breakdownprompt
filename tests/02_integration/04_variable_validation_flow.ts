/**
 * Variable Validation Flow Integration Test
 *
 * Purpose:
 * - Verify the integration of variable validation components
 * - Validate variable validation flow through the system
 * - Ensure proper handling of variable validation errors
 *
 * Intent:
 * - Test variable validation flow
 * - Verify variable validation chain
 * - Test variable validation error handling
 * - Validate variable validation recovery
 *
 * Expected Results:
 * - Variables are validated correctly through the system
 * - Variable validation errors are handled properly
 * - Validation recovery works as expected
 *
 * Success Cases:
 * - Valid variable validation flow
 * - Valid variable validation errors
 * - Valid validation recovery
 *
 * Failure Cases:
 * - Invalid variable validation flow
 * - Invalid variable validation errors
 * - Invalid validation recovery
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { VariableValidator } from "../../src/validation/variable_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../src/errors.ts";

const _logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize VariableValidator and test data
let variableValidator: VariableValidator;

function setupTest() {
  variableValidator = new VariableValidator();
}

// Main Test
Deno.test("should validate basic variable names", () => {
  setupTest();
  const validNames = ["name", "age", "city", "user_name", "firstName"];

  for (const name of validNames) {
    const result = variableValidator.validateKey(name);
    assertEquals(result, true);
  }
});

Deno.test("should reject invalid variable names", async () => {
  setupTest();
  const invalidNames = [
    "invalid-name",
    "1name",
    "name!",
    "name@",
    "name#",
    "name$",
    "name%",
    "name^",
    "name&",
    "name*",
    "name(",
    "name)",
    "name+",
    "name=",
    "name[",
    "name]",
    "name{",
    "name}",
    "name|",
    "name\\",
    "name/",
    "name<",
    "name>",
    "name,",
    "name.",
    "name?",
    "name:",
    "name;",
    "name'",
    'name"',
    "name`",
    "name~",
  ];

  for (const name of invalidNames) {
    await assertRejects(
      () => Promise.resolve(variableValidator.validateKey(name)),
      ValidationError,
      "Invalid variable name",
    );
  }
});

Deno.test("should validate required variables", () => {
  setupTest();
  const required = ["name", "age"];
  const variables = { name: "test", age: "25" };

  variableValidator.validateRequiredVariables(required, variables);
});

Deno.test("should reject missing required variables", async () => {
  setupTest();
  const required = ["name", "age"];
  const variables = { name: "test" };

  await assertRejects(
    () => Promise.resolve(variableValidator.validateRequiredVariables(required, variables)),
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should validate variable values", () => {
  setupTest();
  const variables = { name: "test", age: "25" };

  variableValidator.validateVariables(variables);
});

Deno.test("should reject invalid variable values", async () => {
  setupTest();
  const variables = { name: "", age: "25" };

  await assertRejects(
    () => Promise.resolve(variableValidator.validateVariables(variables)),
    ValidationError,
    "Invalid value for variable",
  );
});
