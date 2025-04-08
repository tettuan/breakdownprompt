import { assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { join } from "https://deno.land/std@0.220.1/path/mod.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../src/core/prompt_manager.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";
import type { PromptParams } from "../src/types/prompt_params.ts";

// Setup and cleanup
Deno.test("Error handling tests", async (t) => {
  // Setup test environment
  await setupTestDirs();

  try {
    // Test invalid prompt file path
    await t.step("invalid prompt file path", async () => {
      const logger = new BreakdownLogger();
      const params: PromptParams = {
        template_file: "",
        variables: {},
      };
      const manager = new PromptManager(params, logger);

      const result = await manager.generatePrompt();
      assertEquals(result.success, false);
      assertEquals(result.error, "Template file path is required");
    });

    // Test empty template
    await t.step("empty template", async () => {
      const logger = new BreakdownLogger();
      const params: PromptParams = {
        template_file: join(TEST_CONFIG.TEMPLATES_DIR, "empty.md"),
        variables: {},
      };
      const manager = new PromptManager(params, logger);

      const result = await manager.generatePrompt();
      assertEquals(result.success, false);
      assertEquals(result.error, "Failed to read template file: Template file is empty");
    });

    // Test invalid template syntax
    await t.step("invalid template syntax", async () => {
      const logger = new BreakdownLogger();
      const params: PromptParams = {
        template_file: join(TEST_CONFIG.TEMPLATES_DIR, "invalid.md"),
        variables: {},
      };
      const manager = new PromptManager(params, logger);

      const result = await manager.generatePrompt();
      assertEquals(result.success, false);
      assertEquals(result.error, "Template file not found: " + join(TEST_CONFIG.TEMPLATES_DIR, "invalid.md"));
    });

    // Test protected template
    await t.step("protected template", async () => {
      const logger = new BreakdownLogger();
      const params: PromptParams = {
        template_file: join(TEST_CONFIG.TEMPLATES_DIR, "protected.md"),
        variables: {},
      };
      const manager = new PromptManager(params, logger);

      const result = await manager.generatePrompt();
      assertEquals(result.success, false);
      assertEquals(result.error, "Template file not found: " + join(TEST_CONFIG.TEMPLATES_DIR, "protected.md"));
    });

    // Test invalid file name
    await t.step("invalid file name", async () => {
      const logger = new BreakdownLogger();
      const params: PromptParams = {
        template_file: join(TEST_CONFIG.TEMPLATES_DIR, "invalid<>:*?.md"),
        variables: {},
      };
      const manager = new PromptManager(params, logger);

      const result = await manager.generatePrompt();
      assertEquals(result.success, false);
      assertEquals(result.error, "Invalid template file path: Contains invalid characters");
    });
  } finally {
    // Cleanup test environment
    await cleanupTestDirs();
  }
});
