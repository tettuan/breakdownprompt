/**
 * Variable Validation Flow Integration Test
 *
 * Purpose:
 * - Verify the integration of variable validation components
 * - Test the flow of using reserved variables in templates and configurations
 * - Ensure proper handling of variable relationships in the validation process
 *
 * Intent:
 * - Test the validation flow of reserved variables
 *   - Variable name validation
 *   - Type validation
 *   - Value validation
 * - Test the integration of validation components
 *   - VariableValidator integration
 *   - ReservedVariableValidator integration
 *   - VariableMatcher integration
 * - Test error handling in the validation flow
 *   - Invalid variable handling
 *   - Type mismatch handling
 *   - Missing variable handling
 *
 * Scope:
 * - Variable validation flow
 *   - Reserved variable validation
 *   - Template variable validation
 *   - Variable matching validation
 * - Component integration
 *   - Validator integration
 *   - Matcher integration
 *   - Error handler integration
 * - Error handling
 *   - Validation error handling
 *   - Integration error handling
 *   - Flow error handling
 *
 * Notes:
 * - All reserved variables are optional
 * - Error messages should be consistent with validation rules
 * - Type validation is strict and follows predefined rules
 */

import { assertRejects } from "jsr:@std/testing@^0.220.1/asserts";
import { VariableValidator } from "../../src/validation/variable_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../src/errors.ts";

const _logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize VariableValidator for testing reserved variable integration
let variableValidator: VariableValidator;

function setupTest() {
  variableValidator = new VariableValidator();
}

// Main Test
// Test reserved variable usage in templates
Deno.test("should use reserved variables in template", () => {
  setupTest();
  const _template = "Using {schema_file} with {template_path}";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
  };
  variableValidator.validateVariables(variables);
});

// Test reserved variable usage in configurations
Deno.test("should use reserved variables in configuration", () => {
  setupTest();
  const config = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
    output_dir: "/path/to/output",
    config_file: "/path/to/config",
  };
  variableValidator.validateVariables(config);
});

// Test rejection of non-reserved variables in templates
Deno.test("should reject non-reserved variables in template", async () => {
  setupTest();
  const _template = "Hello {name} using {schema_file}";
  const variables = {
    schema_file: "/path/to/schema",
    name: "test",
  };

  await assertRejects(
    async () => {
      await variableValidator.validateVariables(variables);
    },
    ValidationError,
    "Non-reserved variable not allowed: name",
  );
});

// Test rejection of non-reserved variables in configurations
Deno.test("should reject non-reserved variables in configuration", async () => {
  setupTest();
  const config = {
    schema_file: "/path/to/schema",
    custom_name: "test",
    template_path: "/path/to/template",
  };

  await assertRejects(
    async () => {
      await variableValidator.validateVariables(config);
    },
    ValidationError,
    "Non-reserved variable not allowed: custom_name",
  );
});
