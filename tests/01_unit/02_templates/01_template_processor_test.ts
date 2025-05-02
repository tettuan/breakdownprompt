/**
 * Template Processor Unit Test
 *
 * Purpose:
 * - Verify the core functionality of template variable replacement
 * - Validate variable types and values
 * - Ensure proper error handling
 *
 * Intent:
 * - Test variable type validation
 * - Test variable value validation
 * - Test template replacement
 * - Test error handling
 */

import { assertEquals, assertThrows } from "jsr:@std/testing@^0.220.1/asserts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { TemplateProcessor } from "../../../src/core/template_processor.ts";
import { TemplateError, ValidationError } from "../../../src/errors.ts";
import type { DirectoryPath, FilePath, TextContent } from "../../../src/types.ts";

const logger = new BreakdownLogger();

Deno.test("TemplateProcessor - Variable Type Validation", async (t) => {
  const processor = new TemplateProcessor();

  await t.step("should validate FilePath type", () => {
    const validPath = "test.md" as FilePath;
    const invalidPath = "test.exe" as FilePath;

    logger.debug("Testing FilePath validation");
    assertEquals(processor.validateFilePath(validPath), true);
    assertThrows(
      () => processor.validateFilePath(invalidPath),
      ValidationError,
      "Invalid file extension",
    );
  });

  await t.step("should validate DirectoryPath type", () => {
    const validPath = "test/" as DirectoryPath;
    const invalidPath = "test.txt" as DirectoryPath;

    logger.debug("Testing DirectoryPath validation");
    assertEquals(processor.validateDirectoryPath(validPath), true);
    assertThrows(
      () => processor.validateDirectoryPath(invalidPath),
      ValidationError,
      "Invalid directory path",
    );
  });

  await t.step("should validate TextContent type", () => {
    const validContent = "Test content" as TextContent;
    const invalidContent = "" as TextContent;

    logger.debug("Testing TextContent validation");
    assertEquals(processor.validateTextContent(validContent), true);
    assertThrows(
      () => processor.validateTextContent(invalidContent),
      ValidationError,
      "Text content cannot be empty",
    );
  });
});

Deno.test("TemplateProcessor - Template Replacement", async (t) => {
  const processor = new TemplateProcessor();

  await t.step("should replace variables in template", () => {
    const template = "File: {file_path}\nDir: {dir_path}\nText: {text_content}";
    const variables = {
      file_path: "test.md" as FilePath,
      dir_path: "test/" as DirectoryPath,
      text_content: "Test content" as TextContent,
    };

    logger.debug("Testing template replacement");
    const result = processor.processTemplate(template, variables);
    assertEquals(
      result,
      "File: test.md\nDir: test/\nText: Test content",
    );
  });

  await t.step("should handle missing variables", () => {
    const template = "File: {file_path}";
    const variables = {};

    logger.debug("Testing missing variable handling");
    assertThrows(
      () => processor.processTemplate(template, variables),
      ValidationError,
      "Missing required variable: file_path",
    );
  });

  await t.step("should handle invalid variable types", () => {
    const template = "File: {file_path}";
    const variables = {
      file_path: "test.exe" as FilePath,
    };

    logger.debug("Testing invalid variable type handling");
    assertThrows(
      () => processor.processTemplate(template, variables),
      ValidationError,
      "Invalid file extension",
    );
  });
});

Deno.test("TemplateProcessor - Error Handling", async (t) => {
  const processor = new TemplateProcessor();

  await t.step("should handle empty template", () => {
    logger.debug("Testing empty template handling");
    assertThrows(
      () => processor.processTemplate("", {}),
      TemplateError,
      "Template is empty",
    );
  });

  await t.step("should handle invalid variable names", () => {
    const template = "Test: {invalid-name}";
    const variables = {
      "invalid-name": "test" as TextContent,
    };

    logger.debug("Testing invalid variable name handling");
    assertThrows(
      () => processor.processTemplate(template, variables),
      ValidationError,
      "Invalid variable name: invalid-name",
    );
  });
});
