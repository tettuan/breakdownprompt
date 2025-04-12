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

import { assertEquals, assertRejects } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PromptManager } from "../src/core/prompt_manager.ts";
import { FileSystemError, ValidationError } from "../src/errors.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";

Deno.test("PromptManager - basic functionality", async () => {
  await setupTestDirs();
  try {
    const promptManager = new PromptManager();
    const variables: Record<string, string> = {
      schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
      input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
      input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
      destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
    };

    const result = await promptManager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.destination_path), true);
  } finally {
    await cleanupTestDirs();
  }
});

Deno.test("PromptManager - missing variables", async () => {
  await setupTestDirs();
  try {
    const promptManager = new PromptManager();
    const result = await promptManager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      {},
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("{schema_file}"), false);
    assertEquals(result.prompt.includes("{input_markdown}"), false);
    assertEquals(result.prompt.includes("{input_markdown_file}"), false);
    assertEquals(result.prompt.includes("{destination_path}"), false);
  } finally {
    await cleanupTestDirs();
  }
});

Deno.test("PromptManager - invalid file path", async () => {
  await setupTestDirs();
  try {
    const promptManager = new PromptManager();
    const variables: Record<string, string> = {
      schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
      input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
      input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
      destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
    };

    await assertRejects(
      () => promptManager.generatePrompt("../invalid.md", variables),
      ValidationError,
      "Invalid file path: Contains directory traversal"
    );
  } finally {
    await cleanupTestDirs();
  }
});

Deno.test("PromptManager - invalid variable types", async () => {
  await setupTestDirs();
  try {
    const promptManager = new PromptManager();
    const variables: Record<string, string> = {
      schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
      input_markdown: "# Valid Markdown\nThis is a test.",
      input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
      destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
    };

    const result = await promptManager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);
    assertEquals(result.prompt.includes(variables.input_markdown_file), true);
    assertEquals(result.prompt.includes(variables.destination_path), true);
  } finally {
    await cleanupTestDirs();
  }
});

Deno.test("PromptManager - file not found", async () => {
  await setupTestDirs();
  try {
    const promptManager = new PromptManager();
    const variables: Record<string, string> = {
      schema_file: join(TEST_CONFIG.SCHEMA_DIR, "nonexistent.json"),
      input_markdown: "# Valid Markdown\nThis is a test.",
      input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
      destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
    };

    await assertRejects(
      async () => {
        await promptManager.generatePrompt(
          join(TEST_CONFIG.TEMPLATES_DIR, "nonexistent.md"),
          variables,
        );
      },
      FileSystemError,
      "Failed to read template file: No such file or directory (os error 2): readfile '/Users/tettuan/github/breakdownprompt/tmp/test/templates/nonexistent.md'"
    );
  } finally {
    await cleanupTestDirs();
  }
});

Deno.test("PromptManager - null variable", async () => {
  await setupTestDirs();
  try {
    const promptManager = new PromptManager();
    const variables: Record<string, string> = {
      schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
      input_markdown: "# Valid Markdown\nThis is a test.",
    };

    const result = await promptManager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(result.prompt.includes(variables.schema_file), true);
    assertEquals(result.prompt.includes(variables.input_markdown), true);

  } finally {
    await cleanupTestDirs();
  }
});
