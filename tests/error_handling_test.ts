import { assert, assertRejects } from "@std/assert";
import { PromptManager } from "../src/prompt_manager.ts";
import { OutputController } from "../src/output_controller.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

// Test unknown variable handling
Deno.test("Error Handling - unknown variable detection", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const manager = new PromptManager();
  const template = "Test with {unknown_variable}";
  const templatePath = `${TEST_CONFIG.BASE_DIR}/unknown_var.md`;
  await Deno.writeTextFile(templatePath, template);

  const params = {
    prompt_file_path: templatePath,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
  };

  await assertRejects(
    async () => {
      logger.debug("Attempting to process template with unknown variable");
      await manager.generatePrompt(params);
    },
    Error,
    "Unknown variable: unknown_variable",
  );

  await cleanupTestDirs();
  logger.debug("Unknown variable handling test completed");
});

// Test invalid value handling
Deno.test("Error Handling - invalid value handling", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const manager = new PromptManager();
  const template = "Test with {schema_file}";
  const templatePath = `${TEST_CONFIG.BASE_DIR}/invalid_value.md`;
  await Deno.writeTextFile(templatePath, template);

  const params = {
    prompt_file_path: templatePath,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
  };

  // Test with invalid schema file value
  const invalidValues = [
    null,
    undefined,
    42,
    true,
    false,
    {},
    [],
  ];

  for (const value of invalidValues) {
    await assertRejects(
      async () => {
        logger.debug("Attempting to process template with invalid value", { value });
        await manager.generatePrompt(params);
      },
      Error,
      "Invalid value for variable: schema_file",
    );
  }

  await cleanupTestDirs();
  logger.debug("Invalid value handling test completed");
});

// Test file system error handling
Deno.test("Error Handling - file system errors", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, false, false);
  
  // Test with non-existent directory
  const nonExistentDir = `${TEST_CONFIG.OUTPUT_DIR}/nonexistent`;
  const nonExistentController = new OutputController(nonExistentDir, false, false);
  
  const result = await nonExistentController.generateOutput("Test content");
  assert(!result.success, "Should fail when directory doesn't exist");
  assert(result.error?.includes("No such file or directory"), "Should have file system error");

  // Test with file instead of directory
  const filePath = `${TEST_CONFIG.OUTPUT_DIR}/test.txt`;
  await Deno.writeTextFile(filePath, "test");
  const fileController = new OutputController(filePath, false, false);
  
  const fileResult = await fileController.generateOutput("Test content");
  assert(!fileResult.success, "Should fail when destination is a file");
  assert(fileResult.error?.includes("Not a directory"), "Should have not a directory error");

  await cleanupTestDirs();
  logger.debug("File system error handling test completed");
});

// Test template loading errors
Deno.test("Error Handling - template loading errors", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const manager = new PromptManager();
  const nonExistentTemplate = `${TEST_CONFIG.BASE_DIR}/nonexistent.md`;
  
  const params = {
    prompt_file_path: nonExistentTemplate,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
  };

  await assertRejects(
    async () => {
      logger.debug("Attempting to load non-existent template");
      await manager.generatePrompt(params);
    },
    Error,
    "Failed to load template",
  );

  // Test with invalid template content
  const invalidTemplate = `${TEST_CONFIG.BASE_DIR}/invalid.md`;
  await Deno.writeTextFile(invalidTemplate, null as unknown as string);

  const invalidParams = {
    prompt_file_path: invalidTemplate,
    destination: TEST_CONFIG.OUTPUT_DIR,
    multipleFiles: false,
    structured: false,
  };

  await assertRejects(
    async () => {
      logger.debug("Attempting to load invalid template");
      await manager.generatePrompt(invalidParams);
    },
    Error,
    "Failed to load template",
  );

  await cleanupTestDirs();
  logger.debug("Template loading error handling test completed");
});

// Test output generation errors
Deno.test("Error Handling - output generation errors", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, false, false);
  
  // Test with invalid content
  const invalidContent = null as unknown as string;
  const result = await controller.generateOutput(invalidContent);
  assert(!result.success, "Should fail with invalid content");
  assert(result.error?.includes("Invalid content"), "Should have invalid content error");

  // Test with empty content
  const emptyResult = await controller.generateOutput("");
  assert(!emptyResult.success, "Should fail with empty content");
  assert(emptyResult.error?.includes("Empty content"), "Should have empty content error");

  await cleanupTestDirs();
  logger.debug("Output generation error handling test completed");
}); 