import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { BreakdownLogger } from "https://jsr.io/@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { ValidationError } from "../../src/errors.ts";

const logger = new BreakdownLogger("path_injection_test");

Deno.test("Security: Path Injection Prevention", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const promptPath = join(testDir, "templates", "basic.md");

  await t.step("1. Directory Traversal Prevention", async () => {
    const variables: Record<string, string> = {
      schema_file: "../../../etc/passwd",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for directory traversal attempt");
    } catch (error) {
      assertExists(error, "Error should be thrown for directory traversal");
      assertEquals(error instanceof ValidationError, true, "Should be a ValidationError");
    }
  });

  await t.step("2. Special Characters in Path", async () => {
    const variables: Record<string, string> = {
      schema_file: "path/with/special/chars/*.json",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for special characters in path");
    } catch (error) {
      assertExists(error, "Error should be thrown for special characters");
      assertEquals(error instanceof ValidationError, true, "Should be a ValidationError");
    }
  });

  await t.step("3. Relative Path Validation", async () => {
    const variables: Record<string, string> = {
      schema_file: "./relative/path/schema.json",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for relative path");
    } catch (error) {
      assertExists(error, "Error should be thrown for relative path");
      assertEquals(error instanceof ValidationError, true, "Should be a ValidationError");
    }
  });
}); 