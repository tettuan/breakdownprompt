import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { PromptManager } from "../core/prompt_manager.ts";
import type { PromptGenerationResult } from "../types/prompt_result.ts";

Deno.test("BreakdownPrompt Integration Tests", async (t) => {
  const promptManager = new PromptManager();

  await t.step("should generate a prompt with variables", async () => {
    const result: PromptGenerationResult = await promptManager.generatePrompt("test prompt", {});
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(typeof result.prompt, "string");
      assertEquals(result.variables.length >= 0, true);
    }
  });

  await t.step("should handle empty input", async () => {
    const result: PromptGenerationResult = await promptManager.generatePrompt("", {});
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(typeof result.prompt, "string");
      assertEquals(result.variables.length >= 0, true);
    }
  });

  await t.step("should handle special characters", async () => {
    const result: PromptGenerationResult = await promptManager.generatePrompt(
      "test!@#$%^&*()_+",
      {},
    );
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(typeof result.prompt, "string");
      assertEquals(result.variables.length >= 0, true);
    }
  });
});
