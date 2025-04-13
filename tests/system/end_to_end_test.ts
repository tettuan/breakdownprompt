import { assertEquals } from "@std/assert";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { cleanupTestDirs, setupTestDirs } from "../test_utils.ts";

const promptManager = new PromptManager();

Deno.test("End-to-end test", async (t) => {
  await setupTestDirs();

  await t.step("1. Initialize PromptManager", () => {
    assertEquals(promptManager instanceof PromptManager, true);
  });

  await t.step("2. Generate prompt with valid parameters", async () => {
    const variables = {
      schema_file: "test-schema.json",
      input_markdown: "# Test\nThis is a test",
      input_markdown_file: "test.md",
      destination_path: "output",
    };

    const result = await promptManager.generatePrompt(
      "tests/fixtures/templates/valid_prompt.md",
      variables,
    );

    assertEquals(result.success, true);
    assertEquals(typeof result.prompt, "string");
  });

  await cleanupTestDirs();
});
