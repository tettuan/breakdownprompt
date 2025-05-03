/**
 * Variable Processor Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the VariableProcessor class
 * - Validate the processing of template variables and reserved variables
 * - Ensure proper handling of class hierarchy in variable processing
 *
 * Scope:
 * - Test processing with base class variables
 * - Verify processing with concrete class variables
 * - Test common processing flow
 * - Validate class hierarchy relationships
 *
 * Test Cases:
 * - Base class variable processing
 *   - Common field processing
 *   - Common method processing
 *   - Protected method handling
 * - Concrete class variable processing
 *   - Specific validation in processing
 *   - Specific conversion in processing
 *   - Error handling in processing
 * - Class hierarchy processing
 *   - Inheritance relationships in processing
 *   - Polymorphism in processing
 *
 * Expected Behavior:
 * - Base class variables are processed correctly
 * - Concrete class variables are processed correctly
 * - Class hierarchy is respected in processing
 * - Common processing flow is maintained
 *
 * Error Cases:
 * - Invalid base class processing
 * - Invalid concrete class processing
 * - Invalid class hierarchy in processing
 * - Invalid processing flow
 */

import { assertEquals, assertRejects } from "jsr:@std/testing@^0.220.1/asserts";
import { VariableProcessor } from "../../../src/core/variable_processor.ts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../../src/errors.ts";
import type { ValidVariableKey } from "../../../src/types.ts";

const _logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize VariableProcessor and test data
let variableProcessor: VariableProcessor;
let variableValidator: VariableValidator;

function setupTest() {
  variableProcessor = new VariableProcessor();
  variableValidator = new VariableValidator();
}

// Helper function to validate and cast variable names
function validateAndCastKey(key: string): ValidVariableKey {
  if (variableValidator.validateKey(key)) {
    return key as ValidVariableKey;
  }
  throw new ValidationError(`Invalid variable key: ${key}`);
}

// Main Test
// Base class variable processing
Deno.test("should process base class common fields", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("test"),
    type: "string",
  };

  const result = await variableProcessor.processBaseClassFields(variable);
  assertEquals(result, true);
});

Deno.test("should process base class common methods", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("test"),
    type: "string",
    value: "test",
  };

  const result = await variableProcessor.processBaseClassMethods(variable);
  assertEquals(result, true);
});

// Concrete class variable processing
Deno.test("should process concrete class specific validation", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableProcessor.processConcreteClassValidation(variable);
  assertEquals(result, true);
});

Deno.test("should process concrete class specific conversion", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableProcessor.processConcreteClassConversion(variable);
  assertEquals(result, true);
});

// Class hierarchy processing
Deno.test("should process class hierarchy inheritance", async () => {
  setupTest();
  const baseVariable = {
    name: validateAndCastKey("test"),
    type: "string",
  };

  const concreteVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
  };

  const result = await variableProcessor.processClassHierarchy(baseVariable, concreteVariable);
  assertEquals(result, true);
});

Deno.test("should process class hierarchy polymorphism", async () => {
  setupTest();
  const baseVariable = {
    name: validateAndCastKey("test"),
    type: "string",
    value: "test",
  };

  const concreteVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableProcessor.processPolymorphism(baseVariable, concreteVariable);
  assertEquals(result, true);
});

// Common processing flow
Deno.test("should process common processing flow", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableProcessor.processCommonProcessingFlow(variable);
  assertEquals(result, true);
});

// Error cases
Deno.test("should reject invalid base class processing", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("test"),
    type: "",
  };

  await assertRejects(
    async () => {
      await variableProcessor.processBaseClassFields(variable);
    },
    ValidationError,
    "Invalid base class processing",
  );
});

Deno.test("should reject invalid concrete class processing", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "invalid/path",
  };

  await assertRejects(
    async () => {
      await variableProcessor.processConcreteClassValidation(variable);
    },
    ValidationError,
    "Invalid concrete class processing",
  );
});

Deno.test("should reject invalid class hierarchy processing", async () => {
  setupTest();
  const baseVariable = {
    name: validateAndCastKey("test"),
    type: "",
  };

  const concreteVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
  };

  await assertRejects(
    async () => {
      await variableProcessor.processClassHierarchy(baseVariable, concreteVariable);
    },
    ValidationError,
    "Invalid class hierarchy processing",
  );
});

Deno.test("should reject invalid processing flow", async () => {
  setupTest();
  const variable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "invalid/path",
  };

  await assertRejects(
    async () => {
      await variableProcessor.processCommonProcessingFlow(variable);
    },
    ValidationError,
    "Invalid processing flow",
  );
});
