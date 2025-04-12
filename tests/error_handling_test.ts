import { assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PromptManager } from "../src/core/prompt_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { FileSystemError, ValidationError } from "../src/errors.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";

const logger = new BreakdownLogger();

Deno.test("Error Handling - missing template file", async () => {
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
  };

  try {
    await manager.generatePrompt(
      join(TEST_CONFIG.TEMPLATES_DIR, "nonexistent.md"),
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
});

Deno.test("Error Handling - invalid file path", async () => {
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output"),
  };

  try {
    await manager.generatePrompt(
      "../invalid.md",
      variables,
    );
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof ValidationError) {
      assertEquals(error.message, "Invalid file path: Contains directory traversal");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
});

Deno.test("Error Handling - invalid variable types", async () => {
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, any> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: 123,
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
      assertEquals(error.message, "input_markdown must be a string");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
});

Deno.test("Error Handling - file not found", async () => {
  await setupTestDirs();

  const manager = new PromptManager();
  const variables: Record<string, string> = {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "nonexistent.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
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
});
