/**
 * Variable Matcher Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the VariableMatcher class
 * - Test the matching process between template variables and reserved variables
 * - Ensure proper handling of class hierarchy in variable matching
 *
 * Intent:
 * - Test variable matching process
 *   - Exact matches between template variables and variables
 *   - Partial matches and mismatches
 *   - Missing variables in template or variables object
 * - Test class hierarchy matching
 *   - Base class field matching
 *   - Base class method matching
 *   - Concrete class specific validation
 *   - Concrete class specific conversion
 *
 * Scope:
 * - Variable matching
 *   - Template variable extraction
 *   - Reserved variable matching
 *   - Type validation
 *   - Value validation
 * - Class hierarchy
 *   - Base class validation
 *   - Concrete class validation
 *   - Polymorphism validation
 * - Error handling
 *   - Invalid variable handling
 *   - Type mismatch handling
 *   - Missing variable handling
 *
 * Notes:
 * - Template variables should be output as-is when variables object is empty
 * - Error messages should be consistent with validation rules
 * - Type validation is strict and follows predefined rules
 */

import { assertEquals, assertRejects } from "jsr:@std/testing@^0.220.1/asserts";
import { VariableMatcher } from "../../../src/core/variable_matcher.ts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../../src/errors.ts";
import type { ValidVariableKey } from "../../../src/types.ts";

const _logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize VariableMatcher and test data
let variableMatcher: VariableMatcher;
let variableValidator: VariableValidator;

function setupTest() {
  variableMatcher = new VariableMatcher();
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
// Base class variable matching
Deno.test("should match base class common fields", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("test"),
    type: "string",
  };

  const reservedVariable = {
    name: validateAndCastKey("test"),
    type: "string",
  };

  const result = await variableMatcher.matchBaseClassFields(templateVariable, reservedVariable);
  assertEquals(result, true);
});

Deno.test("should match base class common methods", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("test"),
    type: "string",
    value: "test",
  };

  const reservedVariable = {
    name: validateAndCastKey("test"),
    type: "string",
    value: "test",
  };

  const result = await variableMatcher.matchBaseClassMethods(templateVariable, reservedVariable);
  assertEquals(result, true);
});

// Concrete class variable matching
Deno.test("should match concrete class specific validation", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableMatcher.matchConcreteClassValidation(
    templateVariable,
    reservedVariable,
  );
  assertEquals(result, true);
});

Deno.test("should match concrete class specific conversion", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableMatcher.matchConcreteClassConversion(
    templateVariable,
    reservedVariable,
  );
  assertEquals(result, true);
});

// Class hierarchy matching
Deno.test("should match class hierarchy inheritance", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("test"),
    type: "string",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
  };

  const result = await variableMatcher.matchClassHierarchy(templateVariable, reservedVariable);
  assertEquals(result, true);
});

Deno.test("should match class hierarchy polymorphism", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("test"),
    type: "string",
    value: "test",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableMatcher.matchPolymorphism(templateVariable, reservedVariable);
  assertEquals(result, true);
});

// Common processing flow matching
Deno.test("should match common processing flow", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  const result = await variableMatcher.matchCommonProcessingFlow(
    templateVariable,
    reservedVariable,
  );
  assertEquals(result, true);
});

// Error cases
Deno.test("should reject invalid base class matching", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("test"),
    type: "",
  };

  const reservedVariable = {
    name: validateAndCastKey("test"),
    type: "string",
  };

  await assertRejects(
    async () => {
      await variableMatcher.matchBaseClassFields(templateVariable, reservedVariable);
    },
    ValidationError,
    "Invalid base class matching",
  );
});

Deno.test("should reject invalid concrete class matching", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "invalid/path",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  await assertRejects(
    async () => {
      await variableMatcher.matchConcreteClassValidation(templateVariable, reservedVariable);
    },
    ValidationError,
    "Invalid concrete class matching",
  );
});

Deno.test("should reject invalid class hierarchy matching", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("test"),
    type: "",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
  };

  await assertRejects(
    async () => {
      await variableMatcher.matchClassHierarchy(templateVariable, reservedVariable);
    },
    ValidationError,
    "Invalid class hierarchy matching",
  );
});

Deno.test("should reject invalid processing flow matching", async () => {
  setupTest();
  const templateVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "invalid/path",
  };

  const reservedVariable = {
    name: validateAndCastKey("schema_file"),
    type: "file_path",
    value: "/path/to/schema",
  };

  await assertRejects(
    async () => {
      await variableMatcher.matchCommonProcessingFlow(templateVariable, reservedVariable);
    },
    ValidationError,
    "Invalid processing flow matching",
  );
});

// Template variable and variables matching
Deno.test("should match template variables with variables object", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path}";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(result, true);
});

Deno.test("should handle partial match between template variables and variables", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path} and {output_dir}";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(
    result,
    true,
    "Template variables not found in variables object should be kept as is",
  );
});

Deno.test("should handle mismatch between template variables and variables", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path}";
  const variables = {
    schema_file: "/path/to/schema",
    output_dir: "/path/to/output",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(
    result,
    true,
    "Template variables not found in variables object should be kept as is",
  );
});

Deno.test("should handle missing variables in template", async () => {
  setupTest();
  const template = "No variables in this template";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(result, true);
});

Deno.test("should handle missing variables in variables object", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path}";
  const variables = {};

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(result, true, "All variables are optional, empty variables object should be valid");
});

Deno.test("should handle nested variable references", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path} in {output_dir}";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
    output_dir: "/path/to/output",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(result, true);
});

Deno.test("should handle duplicate variable references", async () => {
  setupTest();
  const template = "Using {schema_file} with {schema_file} and {template_path}";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(result, true);
});

// Additional test cases for variable relationships
Deno.test("should reject non-reserved variables in variables object", async () => {
  setupTest();
  const template = "Using {name} with {age}";
  const variables = {
    name: "test",
    age: 30,
  };

  await assertRejects(
    async () => {
      await variableMatcher.matchTemplateVariables(template, variables);
    },
    ValidationError,
    "Non-reserved variables are not allowed",
  );
});

Deno.test("should handle empty variables object with template variables", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path}";
  const variables = {};

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(
    result,
    true,
    "Template variables should be output as is when variables object is empty",
  );
});

Deno.test("should handle variable replacement with class processing", async () => {
  setupTest();
  const template = "Using {schema_file} with {template_path}";
  const variables = {
    schema_file: "/path/to/schema",
    template_path: "/path/to/template",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(result, true);
});

Deno.test("should handle variable replacement without variables object values", async () => {
  setupTest();
  const template = "Using {schema_file} with {input_text}";
  const variables = {
    schema_file: "/path/to/schema",
  };

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(
    result,
    true,
    "Template variables should be output as is when not found in variables object",
  );
});

Deno.test("should handle variable replacement with class default processing", async () => {
  setupTest();
  const template = "Using {schema_file}";
  const variables = {};

  const result = await variableMatcher.matchTemplateVariables(template, variables);
  assertEquals(
    result,
    true,
    "Template variables should be output as is when variables object is empty",
  );
});
