import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { TextValidator } from "../../../src/validation/markdown_validator.ts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import type { PromptGenerationResult } from "../../../src/types/prompt_result.ts";

Deno.test("PromptManager - Path Validation", async (t) => {
  const textValidator = new TextValidator();
  const pathValidator = new PathValidator();
  const promptManager = new PromptManager(textValidator, pathValidator);

  await t.step("should allow absolute paths in allowed directories", async () => {
    const tempDir = await Deno.makeTempDir();
    const testFile = `${tempDir}/test.md`;
    await Deno.writeTextFile(testFile, "# Test");

    try {
      const result: PromptGenerationResult = await promptManager.generatePrompt(testFile, {});
      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(typeof result.prompt, "string");
      }
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  await t.step("should allow paths in current directory", async () => {
    const currentDir = Deno.cwd();
    const testFile = `${currentDir}/test.md`;
    await Deno.writeTextFile(testFile, "# Test");

    try {
      const result: PromptGenerationResult = await promptManager.generatePrompt(testFile, {});
      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(typeof result.prompt, "string");
      }
    } finally {
      await Deno.remove(testFile);
    }
  });

  await t.step("should reject absolute paths outside allowed directories", async () => {
    const result: PromptGenerationResult = await promptManager.generatePrompt(
      "/usr/local/test.md",
      {},
    );
    assertEquals(result.success, false);
    if (!result.success) {
      assertEquals(
        result.error,
        "Absolute paths are not allowed. Please use relative paths instead.",
      );
    }
  });
});
