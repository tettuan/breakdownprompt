/**
 * Variable Replacer Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the VariableReplacer class
 * - Validate variable replacement in templates according to specifications
 * - Ensure proper handling of variable types and formats
 * - Test template variable discovery
 * - Test optional variable handling
 *
 * Intent:
 * - Test basic variable replacement
 * - Verify multiple variable replacement
 * - Test special character handling
 * - Validate error handling
 * - Verify variable validation
 * - Test template variable discovery
 * - Test optional variable handling
 *
 * Expected Results:
 * - Variables are replaced correctly in templates
 * - Special characters are handled properly
 * - Error cases are handled appropriately
 * - Template variables are discovered correctly
 * - Optional variables are handled correctly
 *
 * Success Cases:
 * - Single variable replacement
 * - Multiple variable replacement
 * - Special character handling
 * - Empty template handling
 * - Template variable discovery
 * - Optional variable handling
 *
 * Failure Cases:
 * - Invalid variable names
 * - Invalid variable values
 * - Missing required variables
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
import type { TextContent } from "../../../src/types.ts";

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
      _key === "city" || _key === "optional"
    ) {
      return true;
    }
    throw new ValidationError("Invalid variable name");
  };

  _validateTextContent = (_text: string) => {
    if (
      _text === "test" || _text === "25" || _text === "Hello, World!" || _text === "Hello" ||
      _text === "World" || _text === "optional"
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
  const template = "Hello {name}!" as TextContent;
  const variables = { name: "test" };
  const expectedOutput = "Hello test!";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle optional variables", async () => {
  setupTest();
  const template = "Hello {name}! Optional: {optional}" as TextContent;
  const variables = { name: "test" };
  const expectedOutput = "Hello test! Optional: ";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle empty variables", async () => {
  setupTest();
  const template = "Hello {name}!" as TextContent;
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
  const template = "Hello {name}! Your age is {age}." as TextContent;
  const variables = { name: "test", age: "25" };
  const expectedOutput = "Hello test! Your age is 25.";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle partial variable replacement with optional variables", async () => {
  setupTest();
  const template = "Hello {name}! Your age is {age}. Optional: {optional}" as TextContent;
  const variables = { name: "test" };

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
  const template = "Message: {message}" as TextContent;
  const variables = { message: "Hello, World!" };
  const expectedOutput = "Message: Hello, World!";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle special characters in template", async () => {
  setupTest();
  const template = "Hello {name}! This is a special character: @#$%" as TextContent;
  const variables = { name: "test" };
  const expectedOutput = "Hello test! This is a special character: @#$%";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle invalid variable names", async () => {
  setupTest();
  const template = "Hello {invalid-name}!" as TextContent;
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
  const template = "Hello {age}!" as TextContent;
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
  const template = "Hello {name}!" as TextContent;
  const variables = { name: "test" };

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, "Hello test!");
});

Deno.test("should validate variable values", async () => {
  setupTest();
  const template = "Hello {name}!" as TextContent;
  const variables = { name: "test" };

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, "Hello test!");
});

Deno.test("should handle empty template", async () => {
  setupTest();
  const template = "" as TextContent;
  const variables = { name: "test" };
  const expectedOutput = "";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle template with no variables", async () => {
  setupTest();
  const template = "Hello World!" as TextContent;
  const variables = { name: "test" };
  const expectedOutput = "Hello World!";

  const result = await variableReplacer.replaceVariables(template, variables);
  assertEquals(result, expectedOutput);
});

Deno.test("should handle undefined variable values", async () => {
  setupTest();
  const template = "Hello {name}!" as TextContent;
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
  const template = "Hello {name}!" as TextContent;
  const variables = { name: null };

  await assertRejects(
    async () => {
      await variableReplacer.replaceVariables(template, variables);
    },
    ValidationError,
    "Missing required variables",
  );
});

Deno.test("should discover template variables", async () => {
  setupTest();
  const template = "Hello {name}! Your age is {age}. Optional: {optional}" as TextContent;
  const expectedVariables = ["name", "age", "optional"];

  const result = variableReplacer.extractVariables(template);
  assertEquals(result, expectedVariables);
});

Deno.test("should handle template with no variables in discovery", async () => {
  setupTest();
  const template = "Hello World!" as TextContent;
  const expectedVariables: string[] = [];

  const result = variableReplacer.extractVariables(template);
  assertEquals(result, expectedVariables);
});

Deno.test("should handle template with special characters in discovery", async () => {
  setupTest();
  const template = "Hello {name}! This is a special character: @#$%" as TextContent;
  const expectedVariables = ["name"];

  const result = variableReplacer.extractVariables(template);
  assertEquals(result, expectedVariables);
});
