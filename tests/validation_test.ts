/**
 * Validation Tests
 *
 * Purpose:
 * - Verify variable validation functionality
 * - Test path validation rules
 * - Validate markdown content validation
 *
 * Background:
 * These tests ensure the validation works as specified in docs/index.ja.md
 * and follows the design patterns in docs/design_pattern.ja.md.
 */

import { assertEquals, assertThrows } from "@std/assert";
import { DefaultVariableValidator } from "../src/validation/variable_validator.ts";
import { PathValidator } from "../src/validation/path_validator.ts";
import { MarkdownValidator } from "../src/validation/markdown_validator.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { join } from "https://deno.land/std/path/mod.ts";
import { ValidationError } from "../src/errors.ts";

const _logger = new BreakdownLogger();
const variableValidator = new DefaultVariableValidator();
const pathValidator = new PathValidator();
const markdownValidator = new MarkdownValidator();

/**
 * Tests for variable name validation
 */
Deno.test("Variable name validation", () => {
  // Valid variable names
  assertEquals(variableValidator.validateKey("test_var"), true);
  assertEquals(variableValidator.validateKey("TEST_VAR"), true);
  assertEquals(variableValidator.validateKey("test123"), true);
  assertEquals(variableValidator.validateKey("testVar"), true);

  // Invalid variable names - should throw ValidationError
  assertThrows(
    () => variableValidator.validateKey(""),
    ValidationError,
    "Variable name cannot be empty",
  );
  assertThrows(
    () => variableValidator.validateKey("123test"),
    ValidationError,
    "must start with a letter",
  );
  assertThrows(
    () => variableValidator.validateKey("_test"),
    ValidationError,
    "must start with a letter",
  );
  assertThrows(
    () => variableValidator.validateKey("test-var"),
    ValidationError,
    "only alphanumeric characters and underscores allowed",
  );
  assertThrows(
    () => variableValidator.validateKey("test var"),
    ValidationError,
    "only alphanumeric characters and underscores allowed",
  );
  assertThrows(
    () => variableValidator.validateKey("test.var"),
    ValidationError,
    "only alphanumeric characters and underscores allowed",
  );
});

/**
 * Tests for file path validation
 */
Deno.test("File path validation", () => {
  // Valid file paths
  assertEquals(pathValidator.validateFilePath("test.txt"), true);
  assertEquals(pathValidator.validateFilePath("path/to/file.txt"), true);
  assertEquals(pathValidator.validateFilePath("./file.txt"), true);

  // Invalid file paths
  assertEquals(pathValidator.validateFilePath(""), false);
  assertEquals(pathValidator.validateFilePath("../file.txt"), false);
  assertEquals(pathValidator.validateFilePath("/absolute/path.txt"), false);
});

/**
 * Tests for directory path validation
 */
Deno.test("Directory path validation", () => {
  // Valid directory paths
  assertEquals(pathValidator.validateDirectoryPath("test_dir"), true);
  assertEquals(pathValidator.validateDirectoryPath("path/to/dir"), true);
  assertEquals(pathValidator.validateDirectoryPath("./dir"), true);

  // Invalid directory paths
  assertEquals(pathValidator.validateDirectoryPath(""), false);
  assertEquals(pathValidator.validateDirectoryPath("../dir"), false);
  assertEquals(pathValidator.validateDirectoryPath("/absolute/dir"), false);
});

/**
 * Tests for basic markdown content validation
 */
Deno.test("Basic markdown content validation", () => {
  // Valid markdown content
  assertEquals(markdownValidator.validateMarkdown("# Test\nContent"), true);
  assertEquals(markdownValidator.validateMarkdown("# Test\nTest content"), true);
  assertEquals(markdownValidator.validateMarkdown("# Test\n\nMultiple lines"), true);

  // Invalid markdown content
  assertEquals(markdownValidator.validateMarkdown(""), false);
  assertEquals(markdownValidator.validateMarkdown("   "), false);
  assertEquals(markdownValidator.validateMarkdown("No heading"), false);
});

/**
 * Tests for complete variable set validation with test directory setup
 */
Deno.test("Complete variable set validation", async () => {
  await setupTestDirs();

  const variables = {
    input_markdown: "# Test\nContent",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output.md"),
  };

  // Test validation
  assertEquals(await variableValidator.validateVariables(variables), true);

  await cleanupTestDirs();
});

/**
 * Tests for detailed markdown content validation
 */
Deno.test("Detailed markdown content validation", () => {
  // Test various markdown elements
  assertEquals(markdownValidator.validateMarkdown("# Heading 1\nContent"), true);
  assertEquals(markdownValidator.validateMarkdown("# Main\n## Heading 2"), true);
  assertEquals(markdownValidator.validateMarkdown("# Title\n*italic*"), true);
  assertEquals(markdownValidator.validateMarkdown("# Title\n**bold**"), true);
  assertEquals(markdownValidator.validateMarkdown("# List\n- list item"), true);
  assertEquals(markdownValidator.validateMarkdown("# Numbers\n1. numbered item"), true);
  assertEquals(markdownValidator.validateMarkdown("# Links\n[link](url)"), true);
  assertEquals(markdownValidator.validateMarkdown("# Code\n```code block```"), true);

  // Invalid markdown content
  assertEquals(markdownValidator.validateMarkdown("No heading"), false);
  assertEquals(markdownValidator.validateMarkdown("#NoSpace"), false);
  assertEquals(markdownValidator.validateMarkdown(""), false);
});

/**
 * Tests for test directory setup and cleanup
 */
Deno.test("Test setup and cleanup", async () => {
  await setupTestDirs();
  // Add test assertions here if needed
  await cleanupTestDirs();
});
