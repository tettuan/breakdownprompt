import { assertEquals } from "@std/assert";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { cleanupTestDirs, setupTestDirs } from "../../test_utils.ts";
import { ValidationError } from "../../../src/errors.ts";

const logger = new BreakdownLogger();
const promptManager = new PromptManager(logger);

Deno.test("Path error handling - directory traversal", async () => {
  logger.info("Starting test: Path error handling - directory traversal");
  await setupTestDirs();

  const variables = {
    input_markdown: "test",
    input_markdown_file: "../test.md", // ディレクトリトラバーサル
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with directory traversal path", {
    template: "simple.md",
    variables,
  });

  try {
    await promptManager.generatePrompt("simple.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof ValidationError) {
      assertEquals(
        error.message,
        "Invalid file path in input_markdown_file: Contains directory traversal",
      );
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

Deno.test("Path error handling - invalid characters", async () => {
  logger.info("Starting test: Path error handling - invalid characters");
  await setupTestDirs();

  const variables = {
    input_markdown: "test",
    input_markdown_file: "test?.md", // 無効な文字を含む
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with invalid path characters", {
    template: "simple.md",
    variables,
  });

  try {
    await promptManager.generatePrompt("simple.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof ValidationError) {
      assertEquals(
        error.message,
        "Invalid file path in input_markdown_file: Contains invalid characters",
      );
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});
