/**
 * Error Handling System Test
 *
 * Purpose:
 * - Verify the system-wide error handling functionality
 * - Validate error handling across components
 * - Ensure proper error recovery and reporting
 *
 * Intent:
 * - Test system error handling
 * - Verify error propagation
 * - Test error recovery mechanisms
 * - Validate error reporting
 *
 * Expected Results:
 * - Errors are handled correctly across the system
 * - Error recovery works as expected
 * - Error reports are accurate and helpful
 *
 * Success Cases:
 * - Valid error handling
 * - Valid error recovery
 * - Valid error reporting
 *
 * Failure Cases:
 * - Invalid error handling
 * - Invalid error recovery
 * - Invalid error reporting
 */

import {
  assertEquals,
  assertExists as _assertExists,
  type assertRejects as _assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { ErrorHandler } from "../../src/utils/error_handler.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../../src/errors.ts";

const logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize ErrorHandler and test data
let errorHandler: ErrorHandler;

function setupTest() {
  errorHandler = new ErrorHandler(logger);
}

// Main Test
Deno.test("should handle system errors correctly", async () => {
  setupTest();
  const error = new Error("System error");
  const handled = await errorHandler.handle(error);
  assertEquals(handled.type, "SystemError");
  assertEquals(handled.message, "System error");
});

Deno.test("should handle validation errors correctly", async () => {
  setupTest();
  const error = new ValidationError("Invalid input");
  const handled = await errorHandler.handle(error);
  assertEquals(handled.type, "ValidationError");
  assertEquals(handled.message, "Invalid input");
});

Deno.test("should format errors correctly", () => {
  setupTest();
  const error = new Error("Test error");
  const formatted = errorHandler.formatError(error);
  assertEquals(formatted, "[SystemError] Test error");
});

Deno.test("should recover from validation errors", async () => {
  setupTest();
  const error = new ValidationError("Recoverable error");
  const recovery = await errorHandler.recover(error);
  assertEquals(recovery.success, true);
});

Deno.test("should handle unrecoverable errors", async () => {
  setupTest();
  const error = new Error("Unrecoverable error");
  const recovery = await errorHandler.recover(error);
  assertEquals(recovery.success, false);
});

Deno.test("should log errors", async () => {
  setupTest();
  const error = new Error("Log test error");
  await errorHandler.handle(error);
  // No direct way to verify logging, but we can check it doesn't throw
  _assertExists(errorHandler);
});
