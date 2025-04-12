import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { BreakdownLogger } from "https://jsr.io/@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { ValidationError, FileSystemError } from "../../src/errors.ts";

const logger = new BreakdownLogger("edge_cases_test");

Deno.test("Validation: Edge Cases", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const promptPath = join(testDir, "templates", "basic.md");

  await t.step("1. Empty Path", async () => {
    const variables: Record<string, string> = {
      schema_file: "",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for empty path");
    } catch (error) {
      assertExists(error, "Error should be thrown for empty path");
      assertEquals(error instanceof ValidationError, true, "Should be a ValidationError");
    }
  });

  await t.step("2. Invalid Characters in Path", async () => {
    const variables: Record<string, string> = {
      schema_file: "path/with/invalid/chars/\0file.json",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for invalid characters");
    } catch (error) {
      assertExists(error, "Error should be thrown for invalid characters");
      assertEquals(error instanceof ValidationError, true, "Should be a ValidationError");
    }
  });

  await t.step("3. Non-existent File", async () => {
    const variables: Record<string, string> = {
      schema_file: join(testDir, "schema", "non_existent.json"),
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for non-existent file");
    } catch (error) {
      assertExists(error, "Error should be thrown for non-existent file");
      assertEquals(error instanceof FileSystemError, true, "Should be a FileSystemError");
    }
  });

  await t.step("4. Permission Denied", async () => {
    // Create a file with no permissions
    const noPermPath = join(testDir, "input", "no_perm.md");
    await Deno.writeTextFile(noPermPath, "test content");
    await Deno.chmod(noPermPath, 0o000);

    const variables: Record<string, string> = {
      schema_file: join(testDir, "schema", "test_schema.json"),
      input_markdown_file: noPermPath,
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for permission denied");
    } catch (error) {
      assertExists(error, "Error should be thrown for permission denied");
      assertEquals(error instanceof FileSystemError, true, "Should be a FileSystemError");
    }

    // Cleanup
    await Deno.chmod(noPermPath, 0o644);
    await Deno.remove(noPermPath);
  });
}); 