/**
 * Prompt Manager Unit Tests
 *
 * Purpose:
 * - Test individual components of PromptManager in isolation
 * - Verify error handling and edge cases
 * - Test path validation and processing
 */

import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { ValidationError } from "../../src/errors.ts";
import { cleanupTestDirs, setupTestDirs } from "../test_utils.ts";

Deno.test("PromptManager - should validate template path", async () => {
  const manager = new PromptManager();
  await assertRejects(
    async () => {
      await manager.generatePrompt("", {});
    },
    ValidationError,
    "Template file path is empty",
  );
});

Deno.test("PromptManager - should validate variables", async () => {
  const manager = new PromptManager();
  await assertRejects(
    async () => {
      await manager.generatePrompt("test.md", {
        schema_file: 123,
      } as unknown as Record<string, string>);
    },
    ValidationError,
    "schema_file must be a string",
  );
});

Deno.test("PromptManager - should process file URL paths", async () => {
  await setupTestDirs();

  const manager = new PromptManager();
  const result = await manager.generatePrompt(
    "file://tmp/test/templates/simple.md",
    {
      schema_file: "test.json",
      input_markdown: "# Test",
      input_markdown_file: "test.md",
      output_dir: "output",
    },
  );

  assertExists(result);
  assertEquals(typeof result.prompt, "string");

  await cleanupTestDirs();
});

Deno.test("PromptManager - should handle directory traversal attempts", async () => {
  const manager = new PromptManager();
  await assertRejects(
    async () => {
      await manager.generatePrompt("../test.md", {
        schema_file: "test.json",
        input_markdown: "# Test",
        input_markdown_file: "test.md",
        output_dir: "output",
      });
    },
    ValidationError,
    "Invalid file path: Contains directory traversal",
  );
});

Deno.test("PromptManager - should handle missing variables", async () => {
  await setupTestDirs();

  const manager = new PromptManager();
  const result = await manager.generatePrompt("tmp/test/templates/simple.md", {
    schema_file: "test.json",
    input_markdown: "",
    input_markdown_file: "test.md",
    output_dir: "output",
  });

  assertExists(result);
  assertEquals(typeof result.prompt, "string");

  await cleanupTestDirs();
});
