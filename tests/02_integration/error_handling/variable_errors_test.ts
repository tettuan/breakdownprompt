import { assertEquals } from "@std/assert";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { cleanupTestDirs, setupTestDirs } from "../../test_utils.ts";
import { ValidationError } from "../../../src/errors.ts";

const logger = new BreakdownLogger();
const promptManager = new PromptManager();

Deno.test("Variable error handling - invalid variable name", async () => {
  logger.info("Starting test: Variable error handling - invalid variable name");
  await setupTestDirs();

  const variables = {
    "invalid-variable": "test", // ハイフンを含む変数名は無効
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with invalid variable name", {
    template: "simple.md",
    variables,
  });

  try {
    await promptManager.generatePrompt("simple.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof ValidationError) {
      assertEquals(error.message, "Invalid variable name: invalid-variable");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});

Deno.test("Variable error handling - non-string value", async () => {
  logger.info("Starting test: Variable error handling - non-string value");
  await setupTestDirs();

  // テストのためだけに型アサーションを使用
  const variables = {
    input_markdown: 123 as unknown as string, // 数値は無効
    input_markdown_file: "test.md",
    schema_file: "schema.json",
    destination_path: "output.md",
  };

  logger.debug("Attempting to generate prompt with non-string variable value", {
    template: "simple.md",
    variables,
  });

  try {
    await promptManager.generatePrompt("simple.md", variables);
    throw new Error("Expected error was not thrown");
  } catch (error) {
    if (error instanceof ValidationError) {
      assertEquals(error.message, "input_markdown must be a string");
    } else {
      throw error;
    }
  }

  await cleanupTestDirs();
  logger.info("Test completed successfully");
});
