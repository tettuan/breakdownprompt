import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { BreakdownLogger } from "https://jsr.io/@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { join } from "https://deno.land/std/path/mod.ts";
import { FileSystemError } from "../../src/errors.ts";

const logger = new BreakdownLogger("file_access_test");

Deno.test("Security: File Access Control", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const promptPath = join(testDir, "templates", "basic.md");

  await t.step("1. Read Permission Check", async () => {
    // Create a file with no read permissions
    const noReadPath = join(testDir, "input", "no_read.md");
    await Deno.writeTextFile(noReadPath, "test content");
    await Deno.chmod(noReadPath, 0o000);

    const variables: Record<string, string> = {
      schema_file: join(testDir, "schema", "test_schema.json"),
      input_markdown_file: noReadPath,
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for file without read permission");
    } catch (error) {
      assertExists(error, "Error should be thrown for file without read permission");
      assertEquals(error instanceof FileSystemError, true, "Should be a FileSystemError");
    }

    // Cleanup
    await Deno.chmod(noReadPath, 0o644);
    await Deno.remove(noReadPath);
  });

  await t.step("2. Write Permission Check", async () => {
    // Create a directory with no write permissions
    const noWriteDir = join(testDir, "output", "no_write");
    await Deno.mkdir(noWriteDir, { recursive: true });
    await Deno.chmod(noWriteDir, 0o444);

    const variables: Record<string, string> = {
      schema_file: join(testDir, "schema", "test_schema.json"),
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: noWriteDir,
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for directory without write permission");
    } catch (error) {
      assertExists(error, "Error should be thrown for directory without write permission");
      assertEquals(error instanceof FileSystemError, true, "Should be a FileSystemError");
    }

    // Cleanup
    await Deno.chmod(noWriteDir, 0o755);
    await Deno.remove(noWriteDir);
  });

  await t.step("3. File Existence Check", async () => {
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
}); 