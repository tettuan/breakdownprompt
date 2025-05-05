import { assertEquals } from "https://deno.land/std@0.131.0/testing/asserts.ts";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { TextValidator } from "../../../src/validation/markdown_validator.ts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import type { PromptResult } from "../../../src/types/prompt_result.ts";

Deno.test("PromptManager - Path Validation", async (t) => {
  const textValidator = new TextValidator();
  const pathValidator = new PathValidator();
  const promptManager = new PromptManager(textValidator, pathValidator);

  await t.step("should allow absolute paths in allowed directories", async () => {
    const tempDir = await Deno.makeTempDir();
    const testFile = `${tempDir}/test.md`;
    await Deno.writeTextFile(testFile, "# Test");

    try {
      const result: PromptResult = await promptManager.generatePrompt(testFile, {});
      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(typeof result.content, "string");
        assertEquals(result.templatePath, testFile);
        assertEquals(result.variables.detected.length, 0);
        assertEquals(result.variables.replaced.length, 0);
        assertEquals(result.variables.remaining.length, 0);
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
      const result: PromptResult = await promptManager.generatePrompt(testFile, {});
      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(typeof result.content, "string");
        assertEquals(result.templatePath, testFile);
        assertEquals(result.variables.detected.length, 0);
        assertEquals(result.variables.replaced.length, 0);
        assertEquals(result.variables.remaining.length, 0);
      }
    } finally {
      await Deno.remove(testFile);
    }
  });

  await t.step("should reject absolute paths outside allowed directories", async () => {
    const result: PromptResult = await promptManager.generatePrompt(
      "/usr/local/test.md",
      {},
    );
    assertEquals(result.success, false);
    if (!result.success) {
      assertEquals(
        result.error,
        "Absolute paths are not allowed. Please use relative paths instead.",
      );
      assertEquals(result.templatePath, "/usr/local/test.md");
      assertEquals(result.variables.detected.length, 0);
      assertEquals(result.variables.replaced.length, 0);
      assertEquals(result.variables.remaining.length, 0);
    }
  });
});

Deno.test("PromptManager - Variable Replacement", async (t) => {
  const promptManager = new PromptManager();

  await t.step("should replace all variables when all values are provided", async () => {
    const template = "Hello {name}, your task is {task}";
    const variables = { name: "John", task: "Code Review" };
    const result: PromptResult = await promptManager.generatePrompt(template, variables);
    
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Hello John, your task is Code Review");
      assertEquals(result.templatePath, "inline");
      assertEquals(result.variables.detected.length, 2);
      assertEquals(result.variables.replaced.length, 2);
      assertEquals(result.variables.remaining.length, 0);
    }
  });

  await t.step("should track remaining variables when some values are missing", async () => {
    const template = "Hello {name}, your task is {task}";
    const variables = { name: "John" };
    const result: PromptResult = await promptManager.generatePrompt(template, variables);
    
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Hello John, your task is {task}");
      assertEquals(result.templatePath, "inline");
      assertEquals(result.variables.detected.length, 2);
      assertEquals(result.variables.replaced.length, 1);
      assertEquals(result.variables.remaining.length, 1);
      assertEquals(result.variables.remaining[0], "task");
    }
  });

  await t.step("should handle empty variables object", async () => {
    const template = "Hello {name}, your task is {task}";
    const result: PromptResult = await promptManager.generatePrompt(template, {});
    
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, template);
      assertEquals(result.templatePath, "inline");
      assertEquals(result.variables.detected.length, 2);
      assertEquals(result.variables.replaced.length, 0);
      assertEquals(result.variables.remaining.length, 2);
    }
  });

  await t.step("should handle conditional blocks", async () => {
    const template = "Hello {name}{#if task}, your task is {task}{/if}";
    const variables = { name: "John", task: "Code Review" };
    const result: PromptResult = await promptManager.generatePrompt(template, variables);
    
    assertEquals(result.success, true);
    if (result.success) {
      assertEquals(result.content, "Hello John, your task is Code Review");
      assertEquals(result.templatePath, "inline");
      assertEquals(result.variables.detected.length, 2);
      assertEquals(result.variables.replaced.length, 2);
      assertEquals(result.variables.remaining.length, 0);
    }
  });
});
