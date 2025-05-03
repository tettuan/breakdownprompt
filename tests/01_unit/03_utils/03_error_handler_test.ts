/**
 * Error Handler Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the ErrorHandler class
 * - Validate error handling and formatting
 * - Ensure proper error type handling
 *
 * Intent:
 * - Test error handling for different error types
 * - Verify error message formatting
 * - Test error recovery functionality
 * - Validate error reporting
 *
 * Expected Results:
 * - Errors are handled correctly based on their type
 * - Error messages are formatted appropriately
 * - Error recovery works as expected
 * - Error reports are generated correctly
 *
 * Success Cases:
 * - Valid error handling
 * - Valid error formatting
 * - Valid error recovery
 * - Valid error reporting
 *
 * Failure Cases:
 * - Invalid error handling
 * - Invalid error formatting
 * - Invalid error recovery
 * - Invalid error reporting
 */

import {
  assertEquals,
  assertExists,
  type assertRejects as _assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { ErrorHandler } from "../../../src/utils/error_handler.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

// Pre-processing and Preparing Part
// Setup: Initialize ErrorHandler and test data
let errorHandler: ErrorHandler;

function setupTest() {
  errorHandler = new ErrorHandler(logger);
}

// Main Test
Deno.test("should handle validation errors correctly", async () => {
  setupTest();
  const error = new ValidationError("Test validation error");
  const result = await errorHandler.handle(error);
  assertEquals(result.type, "ValidationError");
  assertEquals(result.message, "Test validation error");
});

Deno.test("should handle system errors correctly", async () => {
  setupTest();
  const error = new Error("Test system error");
  const result = await errorHandler.handle(error);
  assertEquals(result.type, "SystemError");
  assertEquals(result.message, "Test system error");
});

Deno.test("should format error messages correctly", () => {
  setupTest();
  const error = new ValidationError("Test error");
  const formatted = errorHandler.formatError(error);
  assertExists(formatted);
  assertEquals(formatted.includes("Test error"), true);
});

Deno.test("should preserve stack traces when needed", async () => {
  setupTest();
  const error = new Error("Test error");
  const result = await errorHandler.handle(error, { preserveStack: true });
  assertExists(result.stack);
});

Deno.test("should recover from recoverable errors", async () => {
  setupTest();
  const error = new ValidationError("Test error");
  const result = await errorHandler.recover(error);
  assertEquals(result.success, true);
});

Deno.test("should fail recovery for unrecoverable errors", async () => {
  setupTest();
  const error = new Error("Test error");
  const result = await errorHandler.recover(error);
  assertEquals(result.success, false);
});
