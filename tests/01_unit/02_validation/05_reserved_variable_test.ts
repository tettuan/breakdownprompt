/**
 * Reserved Variable Validator Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the ReservedVariableValidator class
 * - Validate reserved variable definitions and types
 * - Ensure proper handling of reserved variable validation
 *
 * Intent:
 * - Test reserved variable definition validation
 * - Verify reserved variable type validation
 * - Test reserved variable value validation
 * - Validate error handling
 *
 * Expected Results:
 * - Reserved variables are validated correctly
 * - Types are checked properly
 * - Values are validated appropriately
 * - Error cases are handled correctly
 *
 * Success Cases:
 * - Valid reserved variable definitions
 * - Valid reserved variable types
 * - Valid reserved variable values
 *
 * Failure Cases:
 * - Invalid reserved variable definitions
 * - Invalid reserved variable types
 * - Invalid reserved variable values
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { ReservedVariableValidator } from "../../../src/validation/reserved_variable_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../../src/errors.ts";

const _logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize ReservedVariableValidator and test data
let reservedVariableValidator: ReservedVariableValidator;

function setupTest() {
  reservedVariableValidator = new ReservedVariableValidator();
}

// Main Test
Deno.test("should validate reserved variable definitions", async () => {
  setupTest();
  const validDefinitions = [
    { name: "date", type: "date" },
    { name: "time", type: "time" },
    { name: "timestamp", type: "timestamp" },
    { name: "user", type: "string" },
    { name: "env", type: "string" },
    { name: "random", type: "number" },
  ];

  for (const definition of validDefinitions) {
    const result = await reservedVariableValidator.validateDefinition(definition);
    assertEquals(result, true);
  }
});

Deno.test("should reject invalid reserved variable definitions", async () => {
  setupTest();
  const invalidDefinitions = [
    { name: "invalid-name", type: "string" },
    { name: "1name", type: "string" },
    { name: "name!", type: "string" },
    { name: "", type: "string" },
    { name: "name", type: "invalid-type" },
  ];

  for (const definition of invalidDefinitions) {
    await assertRejects(
      async () => {
        await reservedVariableValidator.validateDefinition(definition);
      },
      ValidationError,
      "Invalid reserved variable definition",
    );
  }
});

Deno.test("should validate reserved variable types", async () => {
  setupTest();
  const validTypes = [
    { name: "date", type: "date", value: new Date() },
    { name: "time", type: "time", value: new Date() },
    { name: "timestamp", type: "timestamp", value: Date.now() },
    { name: "user", type: "string", value: "test" },
    { name: "env", type: "string", value: "development" },
    { name: "random", type: "number", value: 42 },
  ];

  for (const variable of validTypes) {
    const result = await reservedVariableValidator.validateType(variable);
    assertEquals(result, true);
  }
});

Deno.test("should reject invalid reserved variable types", async () => {
  setupTest();
  const invalidTypes = [
    { name: "date", type: "date", value: "not-a-date" },
    { name: "time", type: "time", value: "not-a-time" },
    { name: "timestamp", type: "timestamp", value: "not-a-timestamp" },
    { name: "user", type: "string", value: 123 },
    { name: "env", type: "string", value: null },
    { name: "random", type: "number", value: "not-a-number" },
  ];

  for (const variable of invalidTypes) {
    await assertRejects(
      async () => {
        await reservedVariableValidator.validateType(variable);
      },
      ValidationError,
      "Invalid reserved variable type",
    );
  }
});

Deno.test("should validate reserved variable values", async () => {
  setupTest();
  const validValues = [
    { name: "date", type: "date", value: new Date() },
    { name: "time", type: "time", value: new Date() },
    { name: "timestamp", type: "timestamp", value: Date.now() },
    { name: "user", type: "string", value: "test" },
    { name: "env", type: "string", value: "development" },
    { name: "random", type: "number", value: 42 },
  ];

  for (const variable of validValues) {
    const result = await reservedVariableValidator.validateValue(variable);
    assertEquals(result, true);
  }
});

Deno.test("should reject invalid reserved variable values", async () => {
  setupTest();
  const invalidValues = [
    { name: "date", type: "date", value: null },
    { name: "time", type: "time", value: undefined },
    { name: "timestamp", type: "timestamp", value: -1 },
    { name: "user", type: "string", value: "" },
    { name: "env", type: "string", value: " " },
    { name: "random", type: "number", value: NaN },
  ];

  for (const variable of invalidValues) {
    await assertRejects(
      async () => {
        await reservedVariableValidator.validateValue(variable);
      },
      ValidationError,
      "Invalid reserved variable value",
    );
  }
});
