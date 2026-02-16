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

// --- replaceAll: regex special chars in values ---

Deno.test("replaceAll - $& in value is preserved literally", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Price: {price}", {
    price: "price $& here",
  });
  assertEquals(result.content, "Price: price $& here");
});

Deno.test("replaceAll - $1 in value is preserved literally", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Ref: {ref}", {
    ref: "ref $1 here",
  });
  assertEquals(result.content, "Ref: ref $1 here");
});

Deno.test("replaceAll - $$ in value is preserved literally", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Cost: {cost}", {
    cost: "cost $$100",
  });
  assertEquals(result.content, "Cost: cost $$100");
});

Deno.test("replaceAll - backslash in value is preserved", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Path: {path}", {
    path: "path\\to\\file",
  });
  assertEquals(result.content, "Path: path\\to\\file");
});

// --- replaceAll: brace edge cases ---

Deno.test("replaceAll - nested braces {a{b}} matches greedy inner", () => {
  setupTest();
  // regex /\{([^}]+)\}/ matches {a{b} capturing "a{b" (greedy up to first })
  const result = variableReplacer.replaceAll("{a{b}}", { "a{b": "replaced" });
  // "a{b" is found in variables, so it gets replaced leaving trailing "}"
  assertEquals(result.content, "replaced}");
  assertEquals(result.replaced.length, 1);
});

Deno.test("replaceAll - adjacent {a}{b} both replaced independently", () => {
  setupTest();
  const result = variableReplacer.replaceAll("{a}{b}", { a: "X", b: "Y" });
  assertEquals(result.content, "XY");
  assertEquals(result.replaced.length, 2);
});

Deno.test("replaceAll - whitespace { name } trimmed to name", () => {
  setupTest();
  const result = variableReplacer.replaceAll("Hello { name }!", {
    name: "world",
  });
  assertEquals(result.content, "Hello world!");
  assertEquals(result.replaced, ["name"]);
});

Deno.test("replaceAll - duplicate {name}...{name} all replaced", () => {
  setupTest();
  const result = variableReplacer.replaceAll("{name} and {name}", {
    name: "X",
  });
  assertEquals(result.content, "X and X");
  // replaceAll processes each match, so "name" appears once per occurrence
  assertEquals(result.replaced.includes("name"), true);
  assertEquals(result.remaining.length, 0);
});

// --- replaceVariables ---

Deno.test("replaceVariables - replaces known variables", () => {
  setupTest();
  const result = variableReplacer.replaceVariables(
    "Hello {name}!" as import("../../../src/types/variables.ts").TextContent,
    { name: "world" },
  );
  assertEquals(result, "Hello world!");
});

Deno.test("replaceVariables - undefined value becomes empty string", () => {
  setupTest();
  const result = variableReplacer.replaceVariables(
    "Hello {name}!" as import("../../../src/types/variables.ts").TextContent,
    { name: undefined },
  );
  assertEquals(result, "Hello !");
});

Deno.test("replaceVariables - null value becomes empty string", () => {
  setupTest();
  const result = variableReplacer.replaceVariables(
    "Hello {name}!" as import("../../../src/types/variables.ts").TextContent,
    { name: null },
  );
  assertEquals(result, "Hello !");
});

Deno.test("replaceVariables - non-string value converted via String()", () => {
  setupTest();
  const result = variableReplacer.replaceVariables(
    "Count: {count}" as import("../../../src/types/variables.ts").TextContent,
    { count: 42 },
  );
  assertEquals(result, "Count: 42");
});

Deno.test("replaceVariables - invalid key throws ValidationError", () => {
  setupTest();
  assertThrows(
    () =>
      variableReplacer.replaceVariables(
        "Hello {name}!" as import("../../../src/types/variables.ts").TextContent,
        { "": "test" },
      ),
    ValidationError,
    "Invalid variable name",
  );
});

Deno.test("replaceVariables - calls validateTextContent on values", () => {
  let textValidatorCalled = false;
  const mockValidator = {
    validateKey: (key: string) => {
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        return true;
      }
      throw new ValidationError(`Invalid variable name: ${key}`);
    },
    validateTextContent: (_text: string) => {
      textValidatorCalled = true;
      return true;
    },
    validateVariables: (_variables: Record<string, unknown>) => {},
  } as unknown as import("../../../src/validation/variable_validator.ts").VariableValidator;

  const replacer = new VariableReplacer(logger, mockValidator);
  replacer.replaceVariables(
    "Hello {name}!" as import("../../../src/types/variables.ts").TextContent,
    { name: "world" },
  );
  assertEquals(textValidatorCalled, true);
});

Deno.test("replaceVariables - calls validateVariables on group", () => {
  let groupValidatorCalled = false;
  const mockValidator = {
    validateKey: (key: string) => {
      if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) {
        return true;
      }
      throw new ValidationError(`Invalid variable name: ${key}`);
    },
    validateTextContent: (_text: string) => true,
    validateVariables: (_variables: Record<string, unknown>) => {
      groupValidatorCalled = true;
    },
  } as unknown as import("../../../src/validation/variable_validator.ts").VariableValidator;

  const replacer = new VariableReplacer(logger, mockValidator);
  replacer.replaceVariables(
    "Hello {name}!" as import("../../../src/types/variables.ts").TextContent,
    { name: "world" },
  );
  assertEquals(groupValidatorCalled, true);
});

Deno.test("replaceVariables - $& in values preserved (regex safety)", () => {
  setupTest();
  const result = variableReplacer.replaceVariables(
    "Value: {val}" as import("../../../src/types/variables.ts").TextContent,
    { val: "price $& here" },
  );
  assertEquals(result, "Value: price $& here");
});
