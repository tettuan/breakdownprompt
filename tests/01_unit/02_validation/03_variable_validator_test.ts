/**
 * Variable Validator Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the VariableValidator class
 * - Validate variable name rules according to specifications
 * - Ensure proper handling of variable validation
 *
 * Intent:
 * - Test variable name validation rules
 * - Verify character set validation
 * - Test case sensitivity
 * - Validate error handling
 *
 * Expected Results:
 * - Variable names are validated correctly
 * - Character set rules are enforced
 * - Error cases are handled appropriately
 *
 * Success Cases:
 * - Valid variable names
 * - Valid character sets
 * - Valid case sensitivity
 *
 * Failure Cases:
 * - Invalid variable names
 * - Invalid character sets
 * - Invalid case sensitivity
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";

// Pre-processing and Preparing Part
// Setup: Initialize VariableValidator and test data
let variableValidator: VariableValidator;

function setupTest() {
  variableValidator = new VariableValidator();
}

// Main Test
Deno.test("should validate basic variable names", async () => {
  setupTest();
  const validNames = ["name", "age", "city", "user_name", "firstName"];

  for (const name of validNames) {
    const result = await variableValidator.validateKey(name);
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
      async () => {
        await variableValidator.validateKey(name);
      },
      ValidationError,
      "Invalid variable name",
    );
  }
});

Deno.test("should validate case sensitivity", async () => {
  setupTest();
  const names = ["Name", "NAME", "name"];

  for (const name of names) {
    const result = await variableValidator.validateKey(name);
    assertEquals(result, true);
  }
});

Deno.test("should validate character set", async () => {
  setupTest();
  const validNames = [
    "alpha",
    "beta123",
    "gamma_test",
    "delta_123",
    "epsilon_TEST",
    "zeta_123_test",
    "eta123Test",
    "theta_TEST_123",
    "iota_test_TEST",
    "kappa123_TEST_456",
  ];

  for (const name of validNames) {
    const result = await variableValidator.validateKey(name);
    assertEquals(result, true);
  }
});

Deno.test("should validate first character", async () => {
  setupTest();
  const validNames = ["name", "Name", "NAME"];
  const invalidNames = ["1name", "_name", "0name"];

  for (const name of validNames) {
    const result = await variableValidator.validateKey(name);
    assertEquals(result, true);
  }

  for (const name of invalidNames) {
    await assertRejects(
      async () => {
        await variableValidator.validateKey(name);
      },
      ValidationError,
      "Invalid variable name",
    );
  }
});

Deno.test("should handle empty variable names", async () => {
  setupTest();
  await assertRejects(
    async () => {
      await variableValidator.validateKey("");
    },
    ValidationError,
    "Invalid variable name",
  );
});

Deno.test("should handle whitespace in variable names", async () => {
  setupTest();
  const names = [" name", "name ", "name name"];

  for (const name of names) {
    await assertRejects(
      async () => {
        await variableValidator.validateKey(name);
      },
      ValidationError,
      "Invalid variable name",
    );
  }
});
