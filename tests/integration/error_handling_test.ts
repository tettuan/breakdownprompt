/**
 * Integration tests for error handling in the prompt generation system.
 * These tests verify that appropriate errors are thrown for various invalid inputs.
 */

import { assertRejects } from "@std/assert";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { cleanupTestDirs, setupTestDirs } from "../test_utils.ts";
import type { DirectoryPath as _DirectoryPath, FilePath as _FilePath } from "../../src/types.ts";
import {
  FileSystemError as _FileSystemError,
  ValidationError as _ValidationError,
} from "../../src/errors.ts";
import { BreakdownLogger as _BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new _BreakdownLogger();
const promptManager = new PromptManager(logger);

/**
 * Tests that attempting to use a non-existent template file results in a FileSystemError.
 * This ensures proper error handling when template files are missing.
 */
Deno.test("Error handling - missing template file", async () => {
  logger.info("Starting test: Error handling - missing template file");
  await setupTestDirs();

  const variables = {
    input_markdown: "test",
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with non-existent template", {
    template: "non_existent_template.md",
    variables,
  });

  await assertRejects(
    () => promptManager.generatePrompt("non_existent_template.md", variables),
    _FileSystemError,
    "Template not found",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

/**
 * Tests that attempting to use a template path with directory traversal results in a ValidationError.
 * This ensures security by preventing access to files outside the allowed directories.
 */
Deno.test("Error handling - invalid template path", async () => {
  logger.info("Starting test: Error handling - invalid template path");
  await setupTestDirs();

  const variables = {
    input_markdown: "test",
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with invalid template path", {
    template: "../invalid/path.md",
    variables,
  });

  await assertRejects(
    () => promptManager.generatePrompt("../invalid/path.md", variables),
    _ValidationError,
    "Invalid file path: Contains directory traversal",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

/**
 * Tests that attempting to use invalid variable types results in a ValidationError.
 * This ensures type safety by validating variable values before processing.
 */
Deno.test("Error handling - invalid variables", async () => {
  logger.info("Starting test: Error handling - invalid variables");
  await setupTestDirs();

  const variables = {
    input_markdown: 123 as unknown as string, // Invalid type
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with invalid variables", {
    template: "simple.md",
    variables,
  });

  await assertRejects(
    () => promptManager.generatePrompt("simple.md", variables),
    _ValidationError,
    "input_markdown must be a string",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

/**
 * Tests that attempting to use an empty template path results in a ValidationError.
 * This ensures that empty or invalid template paths are properly handled.
 */
Deno.test("Error handling - empty template", async () => {
  logger.info("Starting test: Error handling - empty template");
  await setupTestDirs();

  const variables = {
    input_markdown: "test",
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with empty template", {
    template: "",
    variables,
  });

  await assertRejects(
    () => promptManager.generatePrompt("", variables),
    _ValidationError,
    "Template file path is empty",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});
