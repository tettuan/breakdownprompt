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

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../src/errors.ts";
import { cleanupTestDirs, setupTestDirs, TEST_PARAMS } from "./test_utils.ts";
import { VariableValidator } from "../src/validation/variable_validator.ts";
import { PathValidator } from "../src/validation/path_validator.ts";
import { MarkdownValidator } from "../src/validation/markdown_validator.ts";

const logger = new BreakdownLogger();

Deno.test("Validation Tests", async (t) => {
  logger.info("Setting up test directories");
  await setupTestDirs();

  await t.step("VariableValidator - should validate variable names", () => {
    const validator = new VariableValidator();

    // Valid variable names
    assertEquals(validator.validateKey("validName"), true);
    assertEquals(validator.validateKey("valid_name"), true);
    assertEquals(validator.validateKey("ValidName123"), true);

    // Invalid variable names
    assertEquals(validator.validateKey("123invalid"), false);
    assertEquals(validator.validateKey("invalid-name"), false);
    assertEquals(validator.validateKey("invalid.name"), false);
    assertEquals(validator.validateKey(""), false);
  });

  await t.step("PathValidator - should validate file paths", () => {
    const validator = new PathValidator();

    // Valid file paths
    assertEquals(validator.validateFilePath(TEST_PARAMS.variables.schema_file), true);
    assertEquals(validator.validateFilePath(TEST_PARAMS.variables.input_markdown_file), true);

    // Invalid file paths
    assertEquals(validator.validateFilePath(""), false);
    assertEquals(validator.validateFilePath("/invalid/path/to/file"), false);
    assertEquals(validator.validateFilePath("../../../../etc/passwd"), false);
  });

  await t.step("PathValidator - should validate directory paths", () => {
    const validator = new PathValidator();

    // Valid directory paths
    assertEquals(validator.validateDirectoryPath(TEST_PARAMS.variables.destination_path), true);

    // Invalid directory paths
    assertEquals(validator.validateDirectoryPath(""), false);
    assertEquals(validator.validateDirectoryPath("/invalid/path/to/dir"), false);
    assertEquals(validator.validateDirectoryPath("../../../../etc"), false);
  });

  await t.step("MarkdownValidator - should validate markdown content", () => {
    const validator = new MarkdownValidator();

    // Valid markdown content
    assertEquals(validator.validateMarkdown(TEST_PARAMS.variables.input_markdown), true);
    assertEquals(validator.validateMarkdown("# Valid\n\nContent"), true);

    // Invalid markdown content
    assertEquals(validator.validateMarkdown(""), false);
    assertEquals(validator.validateMarkdown("   "), false);
    assertEquals(validator.validateMarkdown("\n\n"), false);
  });

  await t.step("VariableValidator - should validate complete variable set", () => {
    const validator = new VariableValidator();

    // Valid variable set
    assertEquals(validator.validateVariables(TEST_PARAMS.variables), true);

    // Invalid variable set
    const invalidVariables = {
      ...TEST_PARAMS.variables,
      schema_file: 123, // Invalid type
    };

    assertThrows(
      () => validator.validateVariables(invalidVariables),
      ValidationError,
      "Invalid value for variable: schema_file",
    );
  });

  await t.step("MarkdownValidator - should validate markdown content correctly", () => {
    const validator = new MarkdownValidator();
    
    // Valid markdown with heading
    assertEquals(validator.validateMarkdown("# Heading\nSome content"), true);
    
    // Invalid cases
    assertEquals(validator.validateMarkdown(""), false);
    assertEquals(validator.validateMarkdown("   "), false);
    assertEquals(validator.validateMarkdown("123"), false); // No heading
    assertEquals(validator.validateMarkdown("Just plain text"), false); // No heading
    assertEquals(validator.validateMarkdown("#NoSpace"), false); // Invalid heading format
  });

  logger.info("Cleaning up test directories");
  await cleanupTestDirs();
});
