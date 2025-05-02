/**
 * Path Validator Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the PathValidator class
 * - Validate file and directory path handling
 * - Ensure proper security checks and path normalization
 *
 * Intent:
 * - Test file path validation
 * - Verify directory path validation
 * - Test extension validation
 * - Validate security checks
 * - Test error handling
 * - Verify path normalization
 * - Test permission checks
 */

import { assertEquals, assertThrows } from "jsr:@std/testing@^0.220.1/asserts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const _logger = new BreakdownLogger();

Deno.test("PathValidator - File path validation", async (t) => {
  const pathValidator = new PathValidator();

  await t.step("should reject empty paths", () => {
    assertThrows(
      () => pathValidator.validateFilePath(""),
      ValidationError,
      "Path cannot be empty",
    );
    assertThrows(
      () => pathValidator.validateFilePath("  "),
      ValidationError,
      "Path cannot be empty",
    );
  });

  await t.step("should reject paths with directory traversal", () => {
    assertThrows(
      () => pathValidator.validateFilePath("../test.txt"),
      ValidationError,
      "Path contains directory traversal",
    );
    assertThrows(
      () => pathValidator.validateFilePath("folder/../test.txt"),
      ValidationError,
      "Path contains directory traversal",
    );
  });

  await t.step("should reject paths with invalid characters", () => {
    assertThrows(
      () => pathValidator.validateFilePath("test<file>.txt"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateFilePath("test|file.txt"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateFilePath("test?file.txt"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateFilePath("test*file.txt"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateFilePath("test\\file.txt"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateFilePath("test file.txt"),
      ValidationError,
      "Path contains invalid characters",
    );
  });

  await t.step("should reject paths exceeding maximum length", () => {
    const longPath = "a".repeat(5000) + ".txt";
    assertThrows(
      () => pathValidator.validateFilePath(longPath),
      ValidationError,
      "Path exceeds maximum length",
    );
  });

  await t.step("should validate and normalize valid file paths", () => {
    assertEquals(pathValidator.validateFilePath("test.txt"), "test.txt");
    assertEquals(pathValidator.validateFilePath("folder/test.txt"), "folder/test.txt");
    assertEquals(
      pathValidator.validateFilePath("folder/subfolder/test.txt"),
      "folder/subfolder/test.txt",
    );
  });
});

Deno.test("PathValidator - Directory path validation", async (t) => {
  const pathValidator = new PathValidator();

  await t.step("should reject empty paths", () => {
    assertThrows(
      () => pathValidator.validateDirectoryPath(""),
      ValidationError,
      "Path cannot be empty",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("  "),
      ValidationError,
      "Path cannot be empty",
    );
  });

  await t.step("should reject paths with directory traversal", () => {
    assertThrows(
      () => pathValidator.validateDirectoryPath("../folder"),
      ValidationError,
      "Path contains directory traversal",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("folder/../other"),
      ValidationError,
      "Path contains directory traversal",
    );
  });

  await t.step("should reject absolute paths outside /tmp", () => {
    assertThrows(
      () => pathValidator.validateDirectoryPath("/usr/local"),
      ValidationError,
      "Absolute paths are not allowed",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("/home/user"),
      ValidationError,
      "Absolute paths are not allowed",
    );
  });

  await t.step("should reject paths with invalid characters", () => {
    assertThrows(
      () => pathValidator.validateDirectoryPath("test<folder>"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("test|folder"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("test?folder"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("test*folder"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("test\\folder"),
      ValidationError,
      "Path contains invalid characters",
    );
    assertThrows(
      () => pathValidator.validateDirectoryPath("test folder"),
      ValidationError,
      "Path contains invalid characters",
    );
  });

  await t.step("should reject paths exceeding maximum length", () => {
    const longPath = "a".repeat(5000);
    assertThrows(
      () => pathValidator.validateDirectoryPath(longPath),
      ValidationError,
      "Path exceeds maximum length",
    );
  });

  await t.step("should validate and normalize valid directory paths", () => {
    assertEquals(pathValidator.validateDirectoryPath("folder"), "folder");
    assertEquals(pathValidator.validateDirectoryPath("folder/subfolder"), "folder/subfolder");
    assertEquals(pathValidator.validateDirectoryPath("/tmp/test"), "/tmp/test");
  });
});
