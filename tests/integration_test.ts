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

import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PromptManager } from "../src/core/prompt_manager.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { join } from "https://deno.land/std/path/mod.ts";
import { FileSystemError, ValidationError } from "../src/errors.ts";

const logger = new BreakdownLogger();

// Test complete workflow with all variables
Deno.test("Integration - complete workflow with all variables", async () => {
  logger.info("Starting complete workflow test");
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
  };

  const result = await manager.generatePrompt(
    join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
    variables,
  );

  assertEquals(result.success, true);
  assertEquals(result.prompt.includes(variables.schema_file), true);
  assertEquals(result.prompt.includes(variables.input_markdown), true);
  assertEquals(result.prompt.includes(variables.input_markdown_file), true);
  assertEquals(result.prompt.includes(variables.destination_path), true);

  await cleanupTestDirs();
  logger.info("Complete workflow test completed");
});

// Test partial variables
Deno.test("Integration - partial variables", async () => {
  logger.info("Starting partial variables test");
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
  };

  const result = await manager.generatePrompt(
    join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
    variables,
  );

  assertEquals(result.success, true);
  assertEquals(result.prompt.includes(variables.schema_file), true);
  assertEquals(result.prompt.includes(variables.input_markdown), true);

  await cleanupTestDirs();
  logger.info("Partial variables test completed");
});

// Test missing variables
Deno.test("Integration - missing variables", async () => {
  logger.info("Starting missing variables test");
  await setupTestDirs();

  const manager = new PromptManager();
  const result = await manager.generatePrompt(
    join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
    {},
  );

  assertEquals(result.success, true);
  assertEquals(result.prompt.includes("{schema_file}"), false);
  assertEquals(result.prompt.includes("{input_markdown}"), false);
  assertEquals(result.prompt.includes("{input_markdown_file}"), false);
  assertEquals(result.prompt.includes("{destination_path}"), false);

  await cleanupTestDirs();
  logger.info("Missing variables test completed");
});

// Test invalid file paths
Deno.test("Integration - invalid file paths", async () => {
  logger.info("Starting invalid file paths test");
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "nonexistent.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "nonexistent.md"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
  };

  try {
    await manager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "definitely_does_not_exist.md"),
      variables,
    );
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof FileSystemError) {
      assertEquals(error.message, "File not found");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Invalid file paths test completed");
});

// Test invalid variable values
Deno.test("Integration - invalid variable values", async () => {
  logger.info("Starting invalid variable values test");
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: "123", // Invalid markdown content
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
  };

  try {
    await manager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof ValidationError) {
      assertEquals(error.message, "Input markdown content must be a string");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Invalid variable values test completed");
});

// Test complex templates
Deno.test("Integration - complex templates", async () => {
  logger.info("Starting complex templates test");
  await setupTestDirs();

  try {
    // Create a complex template file
    const complexTemplatePath = join(TEST_CONFIG.TEMPLATES_DIR, "complex.md");
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

## Nested Variables
- Schema: {schema_file}
- Input: {input_markdown}
- Input File: {input_markdown_file}
- Output: {destination_path}
`;

    await Deno.writeTextFile(complexTemplatePath, complexTemplate);

    const manager = new PromptManager();
    const variables: Record<string, string> = {
      schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
      input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
      input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
      destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
    };

    const result = await manager.generatePrompt(
      complexTemplatePath,
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.destination_path), true);
  } finally {
    await cleanupTestDirs();
    logger.info("Complex templates test completed");
  }
});

Deno.test("Integration Tests", async (t) => {
  await setupTestDirs();

  await t.step("should generate prompt with valid parameters", async () => {
    const manager = new PromptManager();
    const variables = {
      schema_file: "/path/to/schema.json",
      input_markdown: "# Test\nThis is a test markdown file.",
      input_markdown_file: "/path/to/input.md",
      destination_path: "/path/to/output",
    };

    const result = await manager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.destination_path), true);
  });

  await t.step("should handle empty variables", async () => {
    const manager = new PromptManager();
    const variables = {};

    const result = await manager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("{schema_file}"), false);
    assertEquals(result.prompt.includes("{input_markdown}"), false);
    assertEquals(result.prompt.includes("{input_markdown_file}"), false);
    assertEquals(result.prompt.includes("{destination_path}"), false);
  });

  await t.step("should handle whitespace in variables", async () => {
    const manager = new PromptManager();
    const variables = {
      schema_file: "  /path/to/schema.json  ",
      input_markdown: "  # Test\nThis is a test markdown file.  ",
      input_markdown_file: "  /path/to/input.md  ",
      destination_path: "  /path/to/output  ",
    };

    const result = await manager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.destination_path), true);
  });

  await t.step("should handle file not found", async () => {
    const manager = new PromptManager();
    const variables = {};

    try {
      await manager.generatePrompt("nonexistent.md", variables);
      throw new Error("Expected error was not thrown");
    } catch (error) {
      if (error instanceof FileSystemError) {
        assertEquals(error.message, "File not found");
      } else {
        throw error;
      }
    }
  });

  await t.step("should handle invalid file path", async () => {
    const manager = new PromptManager();
    const variables = {};

    try {
      await manager.generatePrompt("../invalid.md", variables);
      throw new Error("Expected error was not thrown");
    } catch (error) {
      if (error instanceof ValidationError) {
        assertEquals(error.message, "Invalid file path: Contains directory traversal");
      } else {
        throw error;
      }
    }
  });

  await cleanupTestDirs();
});
