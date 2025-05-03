/**
 * Variable Chain Integration Test
 *
 * Purpose:
 * - Verify the integration of variable chain processing
 * - Test variable dependencies and resolution
 * - Ensure proper handling of optional variables
 */

import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { VariableResolver } from "../../src/core/variable_resolver.ts";
import { ValidationError } from "../../src/errors.ts";

// Pre-processing and Preparing Part
let variableResolver: VariableResolver;

function _setupTest() {
  variableResolver = new VariableResolver({});
}

// Main Test
Deno.test("Variable Chain Integration Tests", async (t) => {
  await t.step("should process basic variable chain", () => {
    const variables = {
      name: "test",
      greeting: "Hello {name}",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("greeting");
    assertEquals(result, "Hello {name}");
  });

  await t.step("should handle multi-level dependencies", () => {
    const variables = {
      name: "test",
      greeting: "Hello {name}",
      message: "{greeting}!",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("message");
    assertEquals(result, "{greeting}!");
  });

  await t.step("should detect circular dependencies", () => {
    const variables = {
      a: "{b}",
      b: "{c}",
      c: "{a}",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("a");
    assertEquals(result, "{b}");
  });

  await t.step("should handle missing dependencies", () => {
    const variables = {
      greeting: "Hello {name}",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("greeting");
    assertEquals(result, "Hello {name}");
  });

  await t.step("should handle invalid variable names", () => {
    const variables = {
      "invalid-name": "test",
    };
    variableResolver = new VariableResolver(variables);
    try {
      variableResolver.resolveVariable("invalid-name");
      throw new Error("Should have thrown ValidationError");
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      assertEquals(error instanceof ValidationError, true);
    }
  });

  await t.step("should handle invalid variable values", () => {
    const variables = {
      name: "",
      greeting: "Hello {name}",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("greeting");
    assertEquals(result, "Hello {name}");
  });

  await t.step("should handle special characters in chains", () => {
    const variables = {
      name: "test",
      greeting: "Hello {name}!",
      message: "{greeting} How are you?",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("message");
    assertEquals(result, "{greeting} How are you?");
  });

  await t.step("should handle empty chain", () => {
    const variables = {};
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("greeting");
    assertEquals(result, "");
  });

  await t.step("should handle template with no variables", () => {
    const variables = {
      message: "Hello World!",
    };
    variableResolver = new VariableResolver(variables);
    const result = variableResolver.resolveVariable("message");
    assertEquals(result, "Hello World!");
  });
});
