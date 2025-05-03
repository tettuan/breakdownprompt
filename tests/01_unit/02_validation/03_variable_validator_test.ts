/**
 * Variable Validator Unit Test
 *
 * Purpose:
 * - Verify the core functionality of variable name validation
 * - Ensure proper handling of variable name format and rules
 *
 * Intent:
 * - Test variable name format validation rules
 * - Verify character set and case sensitivity rules
 * - Validate error handling for invalid names
 *
 * Scope:
 * - Focus on variable name format validation
 * - Test character set rules (alphanumeric and underscore)
 * - Verify case sensitivity handling
 * - Test first character rules
 * - Validate whitespace handling
 * - Do not test reserved variable validation (covered by reserved_variable_test.ts)
 *
 * Note:
 * - This test focuses on the format of variable names
 * - Reserved variable validation is tested separately
 * - Error messages should be consistent with the validation rules
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";

// Pre-processing and Preparing Part
// Setup: Initialize VariableValidator for testing variable name format
let variableValidator: VariableValidator;

function setupTest() {
  variableValidator = new VariableValidator();
}

// Main Test
// Test basic variable name format
Deno.test("should validate basic variable names", async () => {
  setupTest();
  const validNames = ["name", "age", "city", "user_name", "firstName"];

  for (const name of validNames) {
    const result = await variableValidator.validateKey(name);
    assertEquals(result, true);
  }
});

// Test invalid character handling
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

// Test case sensitivity rules
Deno.test("should validate case sensitivity", async () => {
  setupTest();
  const names = ["Name", "NAME", "name"];

  for (const name of names) {
    const result = await variableValidator.validateKey(name);
    assertEquals(result, true);
  }
});

// Test character set rules
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

// Test first character rules
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

// Test empty name handling
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

// Test whitespace handling
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
