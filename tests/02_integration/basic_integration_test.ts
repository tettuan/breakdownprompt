/**
 * Integration Tests
 *
 * Purpose:
 * - Verify complete workflow of the prompt management system
 * - Test integration between components
 * - Validate end-to-end functionality
 *
 * Background:
 * These tests ensure the system works as specified in docs/index.ja.md
 * and follows the design patterns in docs/design_pattern.ja.md.
 */

import { assert, assertRejects } from "@std/assert";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { cleanupTestDirs, setupTestDirs } from "../test_utils.ts";
import { FileSystemError, ValidationError } from "../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();
const promptManager = new PromptManager();

// Test complete workflow with all variables
Deno.test("Integration - complete workflow with all variables", async () => {
  logger.info("Starting test: complete workflow with all variables");
  await setupTestDirs();

  const result = await promptManager.generatePrompt(
    "tmp/test/templates/simple.md",
    {
      schema_file: "tmp/test/schema/base.schema.json",
      input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
      input_markdown_file: "tmp/test/input/sample.md",
      destination_path: "tmp/test/output/output",
    },
  );

  assert(result.prompt.includes("# Sample Template"));
  assert(result.prompt.includes("tmp/test/schema/base.schema.json"));
  assert(result.prompt.includes("# Sample Markdown"));
  assert(result.prompt.includes("tmp/test/input/sample.md"));
  assert(result.prompt.includes("tmp/test/output/output"));

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test partial variables
Deno.test("Integration - partial variables", async () => {
  logger.info("Starting test: partial variables");
  await setupTestDirs();

  const result = await promptManager.generatePrompt(
    "tmp/test/templates/simple.md",
    {
      schema_file: "tmp/test/schema/base.schema.json",
      input_markdown: "# Sample Markdown",
    },
  );

  assert(result.prompt.includes("# Sample Template"));
  assert(result.prompt.includes("tmp/test/schema/base.schema.json"));
  assert(result.prompt.includes("# Sample Markdown"));
  assert(result.prompt.includes("{input_markdown_file}"));
  assert(result.prompt.includes("{destination_path}"));

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test missing variables
Deno.test("Integration - missing variables", async () => {
  logger.info("Starting test: missing variables");
  await setupTestDirs();

  const result = await promptManager.generatePrompt(
    "tmp/test/templates/simple.md",
    {},
  );

  assert(result.prompt.includes("# Sample Template"));
  assert(result.prompt.includes("{schema_file}"));
  assert(result.prompt.includes("{input_markdown}"));
  assert(result.prompt.includes("{input_markdown_file}"));
  assert(result.prompt.includes("{destination_path}"));

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test invalid file paths
Deno.test("Integration - invalid file paths", async () => {
  logger.info("Starting test: invalid file paths");
  await setupTestDirs();

  await assertRejects(
    () => promptManager.generatePrompt("../invalid/path/template.md", {}),
    ValidationError,
    "Invalid file path: Contains directory traversal",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test invalid variable values
Deno.test("Integration - invalid variable values", async () => {
  logger.info("Starting test: invalid variable values");
  await setupTestDirs();

  await assertRejects(
    () =>
      promptManager.generatePrompt(
        "tmp/test/templates/simple.md",
        {
          schema_file: "../invalid/path/schema.json",
          input_markdown: "# Valid Markdown",
          input_markdown_file: "tmp/test/input/sample.md",
          destination_path: "tmp/test/output/output",
        },
      ),
    ValidationError,
    "Invalid file path in schema_file: Contains directory traversal",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test complex templates
Deno.test("Integration - complex templates", async () => {
  logger.info("Starting test: complex templates");
  await setupTestDirs();

  const complexTemplate = `
# Complex Template

## Schema
{schema_file}

## Input
{input_markdown}

## Input File
{input_markdown_file}

## Output
{destination_path}

## Nested Structure
{schema_file}
  - {input_markdown}
    - {input_markdown_file}
      - {destination_path}
`;

  await Deno.writeTextFile("tmp/test/templates/complex.md", complexTemplate);

  const result = await promptManager.generatePrompt(
    "tmp/test/templates/complex.md",
    {
      schema_file: "tmp/test/schema/base.schema.json",
      input_markdown: "# Sample Markdown",
      input_markdown_file: "tmp/test/input/sample.md",
      destination_path: "tmp/test/output/output",
    },
  );

  assert(result.prompt.includes("# Complex Template"));
  assert(result.prompt.includes("tmp/test/schema/base.schema.json"));
  assert(result.prompt.includes("# Sample Markdown"));
  assert(result.prompt.includes("tmp/test/input/sample.md"));
  assert(result.prompt.includes("tmp/test/output/output"));

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test empty variables
Deno.test("Integration - empty variables", async () => {
  logger.info("Starting test: empty variables");
  await setupTestDirs();

  const result = await promptManager.generatePrompt(
    "tmp/test/templates/simple.md",
    {
      schema_file: "tmp/test/schema/base.schema.json",
      input_markdown: "",
      input_markdown_file: "tmp/test/input/sample.md",
      destination_path: "tmp/test/output/output",
    },
  );

  assert(result.prompt.includes("# Sample Template"));

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test whitespace in variables
Deno.test("Integration - whitespace in variables", async () => {
  logger.info("Starting test: whitespace in variables");
  await setupTestDirs();

  const result = await promptManager.generatePrompt(
    "tmp/test/templates/simple.md",
    {
      schema_file: "tmp/test/schema/base.schema.json",
      input_markdown: "   ",
      input_markdown_file: "tmp/test/input/sample.md",
      destination_path: "tmp/test/output/output",
    },
  );

  assert(result.prompt.includes("# Sample Template"));

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test file not found
Deno.test("Integration - file not found", async () => {
  logger.info("Starting test: file not found");
  await setupTestDirs();

  await assertRejects(
    () =>
      promptManager.generatePrompt(
        "tmp/test/templates/nonexistent.md",
        {
          schema_file: "tmp/test/schema/base.schema.json",
          input_markdown: "# Sample Markdown",
          input_markdown_file: "tmp/test/input/sample.md",
          destination_path: "tmp/test/output/output",
        },
      ),
    FileSystemError,
    "Template not found",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

// Test invalid file path
Deno.test("Integration - invalid file path", async () => {
  logger.info("Starting test: invalid file path");
  await setupTestDirs();

  await assertRejects(
    () =>
      promptManager.generatePrompt(
        "../invalid/path/template.md",
        {
          schema_file: "tmp/test/schema/base.schema.json",
          input_markdown: "# Sample Markdown",
          input_markdown_file: "tmp/test/input/sample.md",
          destination_path: "tmp/test/output/output",
        },
      ),
    ValidationError,
    "Invalid file path: Contains directory traversal",
  );

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});
