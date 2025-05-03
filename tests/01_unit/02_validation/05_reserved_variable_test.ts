/**
 * Reserved Variable Unit Test
 *
 * Purpose:
 * - Verify the validation of reserved variables
 * - Ensure proper handling of reserved variable types and values
 * - Test the relationship between reserved variables and template variables
 *
 * Intent:
 * - Test validation of predefined reserved variables
 * - Verify type checking for reserved variable values
 * - Test error handling for invalid reserved variables
 * - Validate the optional nature of reserved variables
 *
 * Scope:
 * - Reserved variable validation
 *   - Variable name validation
 *   - Type validation for each reserved variable
 *   - Value validation for each reserved variable
 * - Class hierarchy validation
 *   - Base class validation
 *   - Concrete class validation
 *   - Polymorphism validation
 * - Error handling
 *   - Invalid type handling
 *   - Invalid value handling
 *   - Missing variable handling
 *
 * Notes:
 * - All reserved variables are optional
 * - Error messages should be consistent with validation rules
 * - Type validation is strict and follows predefined rules
 */

import { assertRejects } from "jsr:@std/testing@^0.220.1/asserts";
import { ReservedVariableValidator } from "../../../src/validation/reserved_variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

// Pre-processing and Preparing Part
// Setup: Initialize ReservedVariableValidator for testing reserved variables
let reservedVariableValidator: ReservedVariableValidator;
let _logger: BreakdownLogger;

function setupTest() {
  reservedVariableValidator = new ReservedVariableValidator();
  _logger = new BreakdownLogger();
}

// Main Test
// Test reserved variable validation
Deno.test("should validate reserved variables", () => {
  setupTest();
  const validVariables = {
    schema_file: "/path/to/schema.json",
    template_path: "/path/to/template",
    output_dir: "/path/to/output",
    config_file: "/path/to/config.json",
  };
  reservedVariableValidator.validateVariables(validVariables);
});

// Test reserved variable type validation
Deno.test("should validate reserved variable types", () => {
  setupTest();
  const validTypes = {
    schema_file: "/path/to/schema.json",
    template_path: "/path/to/template",
    output_dir: "/path/to/output",
    config_file: "/path/to/config.json",
  };
  reservedVariableValidator.validateVariables(validTypes);
});

// Test rejection of invalid reserved variable types
Deno.test("should reject invalid reserved variable types", async () => {
  setupTest();
  const invalidTypes = {
    schema_file: 123,
    template_path: true,
    output_dir: null,
    config_file: undefined, // Invalid type: undefined instead of string
  };

  await assertRejects(
    async () => {
      await reservedVariableValidator.validateVariables(
        invalidTypes as unknown as Record<string, string>,
      );
    },
    ValidationError,
    "Invalid type for reserved variable",
  );
});

// Test handling of optional reserved variables
Deno.test("should handle optional reserved variables", () => {
  setupTest();
  const partialVariables = {
    schema_file: "/path/to/schema.json",
    output_dir: "/path/to/output",
  };
  reservedVariableValidator.validateVariables(partialVariables);
});

// Test rejection of non-reserved variables
Deno.test("should reject non-reserved variables", async () => {
  setupTest();
  const nonReservedVariables = {
    name: "test", // Not a reserved variable
    age: 25, // Not a reserved variable
    city: "Tokyo", // Not a reserved variable
  };

  await assertRejects(
    async () => {
      await reservedVariableValidator.validateVariables(
        nonReservedVariables as unknown as Record<string, string>,
      );
    },
    ValidationError,
    "Non-reserved variable not allowed: name",
  );
});
