/**
 * Parameter Flow Integration Test
 *
 * Purpose:
 * - Verify the integration of parameter processing components
 * - Validate parameter flow through the system
 * - Ensure proper handling of parameter dependencies
 *
 * Intent:
 * - Test parameter validation flow
 * - Verify parameter processing chain
 * - Test parameter dependency resolution
 * - Validate error handling in parameter flow
 *
 * Expected Results:
 * - Parameters are processed correctly through the system
 * - Parameter dependencies are resolved properly
 * - Errors are handled appropriately
 *
 * Success Cases:
 * - Valid parameter flow
 * - Valid parameter dependencies
 * - Valid error handling
 *
 * Failure Cases:
 * - Invalid parameter flow
 * - Invalid parameter dependencies
 * - Invalid error handling
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { ParameterManager } from "../../src/core/parameter_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../src/errors.ts";
import type {
  Parameters,
  ProcessedParameters as _ProcessedParameters,
  UserParameters,
} from "../../src/types/parameter_types.ts";

const logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize ParameterManager and test data
let parameterManager: ParameterManager;

function setupTest() {
  parameterManager = new ParameterManager(logger);
}

// Main Test
Deno.test("should process basic parameters correctly", async () => {
  setupTest();
  const parameters: Parameters = {
    name: "test",
    age: 25,
    isActive: true,
  };

  const processed = await parameterManager.process(parameters);
  assertEquals(processed.name, "test");
  assertEquals(processed.age, 25);
  assertEquals(processed.isActive, true);
});

Deno.test("should handle parameter dependencies", async () => {
  setupTest();
  const parameters: Parameters = {
    firstName: "John",
    lastName: "Doe",
    fullName: "${firstName} ${lastName}",
  };

  const processed = await parameterManager.process(parameters);
  assertEquals(processed.fullName, "John Doe");
});

Deno.test("should validate parameter types", async () => {
  setupTest();
  const parameters: Parameters = {
    name: "test",
    age: "25" as unknown as number, // Invalid type
    isActive: true,
  };

  await assertRejects(
    async () => {
      await parameterManager.process(parameters);
    },
    ValidationError,
    "Invalid parameter type",
  );
});

Deno.test("should handle required parameters", async () => {
  setupTest();
  const parameters: Parameters = {
    name: "test",
    // age is required but missing
    isActive: true,
  };

  await assertRejects(
    async () => {
      await parameterManager.process(parameters);
    },
    ValidationError,
    "Required parameter missing",
  );
});

Deno.test("should process complex parameter structures", async () => {
  setupTest();
  const parameters: Parameters = {
    user: {
      name: "test",
      age: 25,
      address: {
        street: "123 Main St",
        city: "Test City",
      },
    } as UserParameters,
  };

  const processed = await parameterManager.process(parameters);
  const user = processed.user as UserParameters;
  assertEquals(user.name, "test");
  assertEquals(user.age, 25);
  assertEquals(user.address.street, "123 Main St");
  assertEquals(user.address.city, "Test City");
});
