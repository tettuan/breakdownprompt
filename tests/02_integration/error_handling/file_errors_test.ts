import { assertEquals } from "@std/assert";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { cleanupTestDirs, setupTestDirs } from "../../test_utils.ts";
import { FileSystemError } from "../../../src/errors.ts";

const logger = new BreakdownLogger();
const promptManager = new PromptManager();

Deno.test("Error handling - missing template file", async () => {
  const variables = {
    schema_file: "tests/fixtures/schema/test_schema.json",
    input_markdown: "# Test Content\nThis is a test.",
    input_markdown_file: "tests/fixtures/input/basic.md",
    output_dir: "tests/fixtures/output",
  };

  const manager = new PromptManager();

  try {
    await manager.generatePrompt("non_existent_template.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof FileSystemError) {
      assertEquals(error.message, "Template not found: non_existent_template.md");
    } else {
      throw error;
    }
  }
});

Deno.test("Error handling - empty template", async () => {
  const variables = {
    schema_file: "tests/fixtures/schema/test_schema.json",
    input_markdown: "# Test Content\nThis is a test.",
    input_markdown_file: "tests/fixtures/input/basic.md",
    output_dir: "tests/fixtures/output",
  };

  const manager = new PromptManager();

  try {
    await manager.generatePrompt("empty.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof FileSystemError) {
      assertEquals(error.message, "Template not found: empty.md");
    } else {
      throw error;
    }
  }
});

Deno.test("File error handling - missing template file", async () => {
  logger.info("Starting test: File error handling - missing template file");
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

  try {
    await promptManager.generatePrompt("non_existent_template.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof FileSystemError) {
      assertEquals(error.message, "Template not found: non_existent_template.md");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

Deno.test("File error handling - empty template file", async () => {
  logger.info("Starting test: File error handling - empty template file");
  await setupTestDirs();

  const variables = {
    input_markdown: "test",
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with empty template", {
    template: "empty.md",
    variables,
  });

  try {
    await promptManager.generatePrompt("empty.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof FileSystemError) {
      assertEquals(error.message, "Template not found: empty.md");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});
