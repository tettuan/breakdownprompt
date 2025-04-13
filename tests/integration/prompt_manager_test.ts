/**
 * Prompt Manager Tests
 *
 * Purpose:
 * - Verify core functionality of PromptManager
 * - Test template loading and variable replacement
 * - Validate error handling and edge cases
 *
 * Background:
 * These tests ensure the PromptManager works as specified in docs/index.ja.md
 * and follows the design patterns in docs/design_pattern.ja.md.
 */

import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { cleanupTestDirs, setupTestDirs } from "../test_utils.ts";

Deno.test("PromptManager - basic functionality", async () => {
  await setupTestDirs();

  const variables = {
    schema_file: "test-schema.json",
    input_markdown: "# Test\nThis is a test",
    input_markdown_file: "test.md",
    destination_path: "output",
  };

  const promptManager = new PromptManager();
  const result = await promptManager.generatePrompt(
    "tests/fixtures/templates/valid_prompt.md",
    variables,
  );

  assertExists(result);
  assertEquals(typeof result.prompt, "string");
  assertEquals(result.prompt.includes(variables.schema_file), true);

  await cleanupTestDirs();
});

Deno.test("PromptManager - should generate prompt with valid parameters", async () => {
  const variables = {
    schema_file: "tests/fixtures/schema/test_schema.json",
    input_markdown: "# Test Content\nThis is a test.",
    input_markdown_file: "tests/fixtures/input/basic.md",
    output_dir: "tests/fixtures/output",
  };

  const manager = new PromptManager();
  const result = await manager.generatePrompt(
    "tests/fixtures/templates/basic_template.md",
    variables,
  );

  assertExists(result);
  assertEquals(typeof result.prompt, "string");
  assertEquals(result.prompt.includes(variables.schema_file), true);
  assertEquals(result.prompt.includes(variables.input_markdown), true);
  assertEquals(result.prompt.includes(variables.input_markdown_file), true);
  assertEquals(result.prompt.includes(variables.output_dir), true);
});

Deno.test("PromptManager - should handle invalid variable types", async () => {
  const variables = {
    schema_file: 123, // Invalid type
    input_markdown: "# Test Content",
    input_markdown_file: "test.md",
    output_dir: "output",
  };

  const manager = new PromptManager();
  await assertRejects(
    async () => {
      await manager.generatePrompt(
        "tests/fixtures/templates/basic_template.md",
        variables as unknown as Record<string, string>,
      );
    },
    Error,
    "schema_file must be a string",
  );
});

Deno.test("PromptManager - should handle empty variables", async () => {
  const variables = {
    schema_file: "test-schema.json",
    input_markdown: "",
    input_markdown_file: "test-input.md",
    output_dir: "test/output",
  };

  const manager = new PromptManager();
  const result = await manager.generatePrompt(
    "tests/fixtures/templates/basic_template.md",
    variables,
  );

  assertExists(result);
  assertEquals(typeof result.prompt, "string");
  assertEquals(result.prompt.includes(variables.schema_file), true);
  assertEquals(result.prompt.includes(variables.input_markdown), true);
  assertEquals(result.prompt.includes(variables.input_markdown_file), true);
  assertEquals(result.prompt.includes(variables.output_dir), true);
});

Deno.test("PromptManager - should handle template with multiple sections", async () => {
  const variables = {
    schema_file: "test-schema.json",
    input_markdown: "# Test Content",
    input_markdown_file: "test_input.md",
    output_dir: "test/output",
  };

  const manager = new PromptManager();
  const result = await manager.generatePrompt(
    "tests/fixtures/templates/structured.md",
    variables,
  );

  assertExists(result);
  assertEquals(typeof result.prompt, "string");
  assertEquals(result.prompt.includes("# Section 1"), true);
  assertEquals(result.prompt.includes("# Section 2"), true);
});
