/**
 * Template File Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the TemplateFile class
 * - Validate file extension and reading flow
 * - Ensure proper template parsing and variable extraction
 *
 * Intent:
 * - Test file extension validation
 * - Verify file reading operations
 * - Test variable extraction
 * - Test error handling
 * - Verify file system operations
 * - Test path validation
 */

import {
  assertEquals,
  type assertExists as _assertExists,
  assertRejects,
} from "jsr:@std/testing@^0.220.1/asserts";
import { TemplateFile } from "../../../src/core/template_file.ts";
import type { FileUtils } from "../../../src/utils/file_utils.ts";
import type { PathValidator as _PathValidator } from "../../../src/validation/path_validator.ts";
import type { VariableValidator as _VariableValidator } from "../../../src/validation/variable_validator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

// Setup: Initialize mock objects
const mockFileUtils = {
  readFile: (path: string) => {
    logger.debug("Reading file", { path });
    if (path === "test/template.md") {
      return "Hello {{name}}";
    }
    throw new Error("File not found");
  },
  writeFile: async () => {},
  exists: () => true,
  directoryExists: () => false,
  createDirectory: async () => {},
  normalizePath: (path: string) => path,
} as unknown as FileUtils;

// Main: Test cases for template file operations
Deno.test("should accept valid file extensions", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const validExtensions = [".md", ".txt", ".yml"];

  validExtensions.forEach((ext) => {
    const path = `test/template${ext}`;
    logger.debug("Testing valid extension", { extension: ext });
    assertEquals(templateFile.validate(path), true);
  });
});

Deno.test("should reject invalid file extensions", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const invalidPath = "test/template.xyz";
  logger.debug("Testing invalid extension", { path: invalidPath });
  assertEquals(templateFile.validate(invalidPath), false);
});

Deno.test("should read template file successfully", async () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templatePath = "test/template.md";
  const templateContent = "Hello {{name}}";

  const result = await templateFile.read(templatePath);
  logger.debug("Read result", { content: result });
  assertEquals(result, templateContent);
});

Deno.test("should handle file read errors", async () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templatePath = "test/error.md";
  logger.debug("Testing file read error", { path: templatePath });

  await assertRejects(
    () => templateFile.read(templatePath),
    Error,
    "File not found",
  );
});

Deno.test("should extract variables from template", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templateContent = "Hello {{name}}, Age: {{age}}";
  const expectedVariables = ["name", "age"];

  const variables = templateFile.extractVariables(templateContent);
  logger.debug("Extracted variables", { variables });
  assertEquals(variables, expectedVariables);
});

Deno.test("should handle templates without variables", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templateContent = "Hello World";

  const variables = templateFile.extractVariables(templateContent);
  logger.debug("Extracted variables", { variables });
  assertEquals(variables, []);
});

Deno.test("should handle nested variables", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templateContent = "Hello {{user.name}}, Age: {{user.age}}";
  const expectedVariables = ["user.name", "user.age"];

  const variables = templateFile.extractVariables(templateContent);
  logger.debug("Extracted variables", { variables });
  assertEquals(variables, expectedVariables);
});

Deno.test("should handle malformed template syntax", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const malformedTemplates = [
    { content: "Hello {{name}", expected: [] },
    { content: "Hello {{name}} {{age", expected: ["name"] },
    { content: "Hello {{", expected: [] },
    { content: "Hello }}", expected: [] },
  ];

  malformedTemplates.forEach(({ content, expected }) => {
    logger.debug("Testing malformed template syntax", { content });
    const variables = templateFile.extractVariables(content);
    logger.debug("Extracted variables from malformed template", { variables });
    assertEquals(variables, expected, `Failed for template: ${content}`);
  });
});

Deno.test("should handle empty template", () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templateContent = "";

  const variables = templateFile.extractVariables(templateContent);
  logger.debug("Extracted variables from empty template", { variables });
  assertEquals(variables, []);
});

Deno.test("should handle file system errors", async () => {
  const templateFile = new TemplateFile(mockFileUtils, logger);
  const templatePath = "test/fs_error.md";
  logger.debug("Testing file system error", { path: templatePath });

  await assertRejects(
    () => templateFile.read(templatePath),
    Error,
    "File not found",
  );
});
