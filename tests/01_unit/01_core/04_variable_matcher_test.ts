/**
 * Variable Matcher Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the VariableMatcher class
 * - Validate variable matching between reserved and template variables
 * - Ensure proper handling of variable types and formats
 *
 * Intent:
 * - Test basic variable matching
 * - Verify reserved variable matching
 * - Test variable type validation
 * - Validate error handling
 *
 * Expected Results:
 * - Variables are matched correctly
 * - Reserved variables are handled properly
 * - Error cases are handled appropriately
 *
 * Success Cases:
 * - Valid variable matching
 * - Valid reserved variable matching
 * - Valid type validation
 *
 * Failure Cases:
 * - Invalid variable names
 * - Invalid variable types
 * - Missing variables
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { VariableMatcher } from "../../../src/core/variable_matcher.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../../src/errors.ts";

const logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize VariableMatcher and test data
let variableMatcher: VariableMatcher;

function setupTest() {
  variableMatcher = new VariableMatcher(logger);
}

// Main Test
Deno.test("should match basic variables", async () => {
  setupTest();
  const templateVariables = ["name", "age"];
  const reservedVariables = {
    name: { type: "string", value: "test" },
    age: { type: "number", value: 25 },
  };

  const result = await variableMatcher.match(templateVariables, reservedVariables);
  assertEquals(result.matched.length, 2);
  assertEquals(result.unmatched.length, 0);
});

Deno.test("should handle reserved variables", async () => {
  setupTest();
  const templateVariables = ["date", "time"];
  const reservedVariables = {
    date: { type: "date", value: new Date() },
    time: { type: "time", value: new Date() },
  };

  const result = await variableMatcher.match(templateVariables, reservedVariables);
  assertEquals(result.matched.length, 2);
  assertEquals(result.unmatched.length, 0);
});

Deno.test("should detect mismatches", async () => {
  setupTest();
  const templateVariables = ["name", "age", "city"];
  const reservedVariables = {
    name: { type: "string", value: "test" },
    age: { type: "number", value: 25 },
  };

  const result = await variableMatcher.match(templateVariables, reservedVariables);
  assertEquals(result.matched.length, 2);
  assertEquals(result.unmatched.length, 1);
  assertEquals(result.unmatched[0], "city");
});

Deno.test("should handle invalid variable names", async () => {
  setupTest();
  const templateVariables = ["invalid-name"];
  const reservedVariables = {};

  await assertRejects(
    async () => {
      await variableMatcher.match(templateVariables, reservedVariables);
    },
    ValidationError,
    "Invalid variable name",
  );
});

Deno.test("should handle reserved variables validation", async () => {
  setupTest();
  const templateVariables = ["name"];
  const reservedVariables = {
    name: { type: "string", value: "test" },
  };

  const result = await variableMatcher.match(templateVariables, reservedVariables);
  assertEquals(result.matched.length, 1);
  assertEquals(result.unmatched.length, 0);
});

Deno.test("should handle empty template variables", async () => {
  setupTest();
  const templateVariables: string[] = [];
  const reservedVariables = {
    name: { type: "string", value: "test" },
  };

  const result = await variableMatcher.match(templateVariables, reservedVariables);
  assertEquals(result.matched.length, 0);
  assertEquals(result.unmatched.length, 0);
});

Deno.test("should handle empty reserved variables", async () => {
  setupTest();
  const templateVariables = ["name", "age"];
  const reservedVariables = {};

  const result = await variableMatcher.match(templateVariables, reservedVariables);
  assertEquals(result.matched.length, 0);
  assertEquals(result.unmatched.length, 2);
});
