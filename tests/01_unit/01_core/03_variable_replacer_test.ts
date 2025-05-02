/**
 * Variable Replacer Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the VariableReplacer class
 * - Validate variable replacement in templates according to specifications
 * - Ensure proper handling of variable types and formats
 *
 * Intent:
 * - Test basic variable replacement
 * - Verify multiple variable replacement
 * - Test special character handling
 * - Validate error handling
 * - Verify variable validation
 *
 * Expected Results:
 * - Variables are replaced correctly in templates
 * - Special characters are handled properly
 * - Error cases are handled appropriately
 *
 * Success Cases:
 * - Single variable replacement
 * - Multiple variable replacement
 * - Special character handling
 * - Empty template handling
 *
 * Failure Cases:
 * - Invalid variable names
 * - Invalid variable values
 * - Missing variables
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { VariableReplacer } from "../../../src/core/variable_replacer.ts";
import type { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Mock functions and objects for validation
let _validateKey: (key: string) => boolean;
let _validateTextContent: (text: string) => boolean;
let validateRequiredVariables: (required: string[], variables: Record<string, unknown>) => void;
let mockVariableValidator: VariableValidator;
let variableReplacer: VariableReplacer;

function setupTest() {
  _validateKey = (_key: string) => {
    if (
      _key === "name" || _key === "age" || _key === "message" || _key === "greeting" ||
      _key === "city"
    ) {
      return true;
    }
    throw new ValidationError("Invalid variable name");
  };

  _validateTextContent = (_text: string) => {
    if (
      _text === "test" || _text === "25" || _text === "Hello, World!" || _text === "Hello" ||
      _text === "World"
    ) {
      return true;
    }
    throw new ValidationError("Invalid variable value");
  };

  validateRequiredVariables = (required: string[], variables: Record<string, unknown>) => {
    const missingVars = required.filter((varName) => {
      const value = variables[varName];
      return value === undefined || value === null ||
        (typeof value === "string" && value.trim() === "");
    });

    if (missingVars.length > 0) {
      throw new ValidationError(`Missing required variables: ${missingVars.join(", ")}`);
    }
  };

  mockVariableValidator = {
    validateKey: (key: string) => _validateKey(key),
    validateTextContent: (text: string) => _validateTextContent(text),
    validateRequiredVariables: (required: string[], variables: Record<string, unknown>) =>
      validateRequiredVariables(required, variables),
    validateVariables: (_variables: Record<string, unknown>) => {},
  } as unknown as VariableValidator;

  // Initialize VariableReplacer with logger
  variableReplacer = new VariableReplacer(logger, mockVariableValidator);
}

// Main Test
Deno.test("should replace single variable", async () => {
  setupTest();
  const template = "Hello {name}";
  const variables = { name: "test" };
  const expectedOutput = "Hello test";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle empty variables", async () => {
  setupTest();
  const template = "Hello {name}";
  const variables = {};

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should replace multiple variables", async () => {
  setupTest();
  const template = "Name: {name}, Age: {age}";
  const variables = { name: "test", age: "25" };
  const expectedOutput = "Name: test, Age: 25";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle partial variable replacement", async () => {
  setupTest();
  const template = "Name: {name}, Age: {age}, City: {city}";
  const variables = { name: "test", age: "25" };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should handle special characters in variables", async () => {
  setupTest();
  const template = "Message: {message}";
  const variables = { message: "Hello, World!" };
  const expectedOutput = "Message: Hello, World!";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle special characters in template", async () => {
  setupTest();
  const template = "{greeting}, {name}!";
  const variables = { greeting: "Hello", name: "World" };
  const expectedOutput = "Hello, World!";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle invalid variable names", async () => {
  setupTest();
  const template = "Hello {invalid-name}";
  const variables = { "invalid-name": "test" };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Invalid variable name",
  );
});

Deno.test("should handle invalid variable values", async () => {
  setupTest();
  const template = "Age: {age}";
  const variables = { age: "invalid" };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Invalid variable value",
  );
});

Deno.test("should validate variable names", async () => {
  setupTest();
  const template = "Hello {name}";
  const variables = { name: "test" };

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, "Hello test");
});

Deno.test("should validate variable values", async () => {
  setupTest();
  const template = "Age: {age}";
  const variables = { age: "25" };

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, "Age: 25");
});

Deno.test("should handle empty template", async () => {
  setupTest();
  const template = "";
  const variables = { name: "test" };
  const expectedOutput = "";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle template with no variables", async () => {
  setupTest();
  const template = "Hello World";
  const variables = { name: "test" };
  const expectedOutput = "Hello World";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle undefined variable values", async () => {
  setupTest();
  const template = "Hello {name}";
  const variables = { name: undefined };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should handle null variable values", async () => {
  setupTest();
  const template = "Hello {name}";
  const variables = { name: null };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should handle non-string variable values", async () => {
  setupTest();
  const template = "Age: {age}";
  const variables = { age: 25 };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Invalid variable value",
  );
});
