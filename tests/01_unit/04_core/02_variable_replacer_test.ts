/**
 * Variable Replacer Unit Test
 *
 * Purpose:
 * - Verify extractVariables, validateKeys, and replaceAll methods
 * - Validate variable extraction from templates
 * - Ensure proper variable replacement behavior
 * - Test key validation
 */

import { assertEquals, assertThrows } from "@std/assert";
import { VariableReplacer } from "../../../src/core/variable_replacer.ts";
import type { VariableValidator } from "../../../src/validation/variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

let mockVariableValidator: VariableValidator;
let variableReplacer: VariableReplacer;

function setupTest(): void {
  mockVariableValidator = {
    validateKey: (key: string) => {
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        return true;
      }
      throw new ValidationError(`Invalid variable name: ${key}`);
    },
    validateTextContent: (_text: string) => true,
    validateVariables: (_variables: Record<string, unknown>) => {},
  } as unknown as VariableValidator;

  variableReplacer = new VariableReplacer(logger, mockVariableValidator);
}

// --- extractVariables ---

Deno.test("extractVariables - should discover template variables", () => {
  setupTest();
  const result = variableReplacer.extractVariables(
    "Hello {name}! Your age is {age}. Optional: {optional}",
  );
  assertEquals(result, ["name", "age", "optional"]);
});

Deno.test("extractVariables - should handle template with no variables", () => {
  setupTest();
  const result = variableReplacer.extractVariables("Hello World!");
  assertEquals(result, []);
});

Deno.test("extractVariables - should handle empty content", () => {
  setupTest();
  const result = variableReplacer.extractVariables("");
  assertEquals(result, []);
});

Deno.test("extractVariables - should deduplicate variables", () => {
  setupTest();
  const result = variableReplacer.extractVariables("{name} and {name}");
  assertEquals(result, ["name"]);
});

Deno.test("extractVariables - should handle special characters in template", () => {
  setupTest();
  const result = variableReplacer.extractVariables(
    "Hello {name}! This is a special character: @#$%",
  );
  assertEquals(result, ["name"]);
});

// --- validateKeys ---

Deno.test("validateKeys - should accept valid keys", () => {
  setupTest();
  variableReplacer.validateKeys({ name: "test", age: "25" });
});

Deno.test("validateKeys - should reject invalid keys", () => {
  setupTest();
  assertThrows(
    () => variableReplacer.validateKeys({ "invalid-name": "test" }),
    ValidationError,
    "Invalid variable name",
  );
});

Deno.test("validateKeys - should handle empty variables", () => {
  setupTest();
  variableReplacer.validateKeys({});
});

// --- replaceAll ---

Deno.test("replaceAll - should replace single variable", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Hello {name}!", { name: "test" });
  assertEquals(result.content, "Hello test!");
  assertEquals(result.replaced, ["name"]);
  assertEquals(result.remaining, []);
});

Deno.test("replaceAll - should replace multiple variables", () => {
  setupTest();
  const result = variableReplacer.replaceAll(
    "Hello {name}! Your age is {age}.",
    { name: "test", age: "25" },
  );
  assertEquals(result.content, "Hello test! Your age is 25.");
  assertEquals(result.replaced.length, 2);
  assertEquals(result.remaining, []);
});

Deno.test("replaceAll - should leave missing variables in content", () => {
  setupTest();
  const result = variableReplacer.replaceAll(
    "Hello {name}! Your age is {age}.",
    { name: "test" },
  );
  assertEquals(result.content, "Hello test! Your age is {age}.");
  assertEquals(result.replaced, ["name"]);
  assertEquals(result.remaining, ["age"]);
});

Deno.test("replaceAll - should handle empty variables record", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Hello {name}!", {});
  assertEquals(result.content, "Hello {name}!");
  assertEquals(result.replaced, []);
  assertEquals(result.remaining, ["name"]);
});

Deno.test("replaceAll - should handle template with no variables", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Hello World!", { name: "test" });
  assertEquals(result.content, "Hello World!");
  assertEquals(result.replaced, []);
  assertEquals(result.remaining, []);
});

Deno.test("replaceAll - should handle special characters in values", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Message: {message}", {
    message: "Hello, World!",
  });
  assertEquals(result.content, "Message: Hello, World!");
});

Deno.test("replaceAll - should handle special characters in template", () => {
  setupTest();
  const result = variableReplacer.replaceAll(
    "Hello {name}! This is a special character: @#$%",
    { name: "test" },
  );
  assertEquals(result.content, "Hello test! This is a special character: @#$%");
});

Deno.test("replaceAll - should handle empty template", () => {
  setupTest();
  const result = variableReplacer.replaceAll("", { name: "test" });
  assertEquals(result.content, "");
  assertEquals(result.replaced, []);
  assertEquals(result.remaining, []);
});

Deno.test("replaceAll - should treat empty string values as remaining", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Hello {name}!", { name: "" });
  assertEquals(result.content, "Hello {name}!");
  assertEquals(result.replaced, []);
  assertEquals(result.remaining, ["name"]);
});
