/**
 * Parameter Validator Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the ParameterValidator class
 * - Validate parameter validation rules according to specifications
 * - Ensure proper handling of parameter validation
 *
 * Intent:
 * - Test parameter validation rules
 * - Verify file path validation
 * - Test variable validation
 * - Validate error handling
 *
 * Expected Results:
 * - Parameters are validated correctly
 * - File paths are validated properly
 * - Error cases are handled appropriately
 *
 * Success Cases:
 * - Valid parameters
 * - Valid file paths
 * - Valid variables
 *
 * Failure Cases:
 * - Invalid parameters
 * - Invalid file paths
 * - Invalid variables
 */

import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { ParameterValidator } from "../../../src/validation/parameter_validator.ts";

// Pre-processing and Preparing Part
// Setup: Initialize ParameterValidator and test data
let parameterValidator: ParameterValidator;

function setupTest() {
  parameterValidator = new ParameterValidator();
}

// Main Test
Deno.test("should validate valid parameters", () => {
  setupTest();
  const params = {
    prompt_file_path: "test.md",
    variables: {
      name: "test",
      age: 25,
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, true);
});

Deno.test("should reject null parameters", () => {
  setupTest();
  const result = parameterValidator.validate(null);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "Required parameters are missing");
});

Deno.test("should reject undefined parameters", () => {
  setupTest();
  const result = parameterValidator.validate(undefined);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "Required parameters are missing");
});

Deno.test("should reject empty parameters", () => {
  setupTest();
  const result = parameterValidator.validate({});
  assertEquals(result.isValid, false);
  assertEquals(result.error, "Required parameters are missing");
});

Deno.test("should reject missing prompt_file_path", () => {
  setupTest();
  const params = {
    variables: {
      name: "test",
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "prompt_file_path is required");
});

Deno.test("should reject empty prompt_file_path", () => {
  setupTest();
  const params = {
    prompt_file_path: "",
    variables: {
      name: "test",
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "prompt_file_path cannot be empty");
});

Deno.test("should reject path traversal in prompt_file_path", () => {
  setupTest();
  const params = {
    prompt_file_path: "../test.md",
    variables: {
      name: "test",
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "File path contains path traversal patterns");
});

Deno.test("should accept valid variables", () => {
  setupTest();
  const params = {
    prompt_file_path: "test.md",
    variables: {
      name: "test",
      age: 25,
      user_id: "123",
      isActive: true,
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, true);
});

Deno.test("should reject invalid variable names", () => {
  setupTest();
  const params = {
    prompt_file_path: "test.md",
    variables: {
      "invalid-name": "test",
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "Invalid variable name: invalid-name");
});

Deno.test("should reject empty variable values", () => {
  setupTest();
  const params = {
    prompt_file_path: "test.md",
    variables: {
      name: "",
    },
  };

  const result = parameterValidator.validate(params);
  assertEquals(result.isValid, false);
  assertEquals(result.error, "Variable value cannot be empty, null, or undefined: name");
});
