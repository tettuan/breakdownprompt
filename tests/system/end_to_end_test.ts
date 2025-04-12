import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { BreakdownLogger } from "https://jsr.io/@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const logger = new BreakdownLogger("end_to_end_test");

Deno.test("End-to-End: Basic Prompt Processing", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const promptPath = join(testDir, "templates", "basic.md");
  const schemaPath = join(testDir, "schema", "test_schema.json");
  const inputPath = join(testDir, "input", "basic.md");
  const outputDir = join(testDir, "output");

  const variables: Record<string, string> = {
    schema_file: schemaPath,
    input_markdown_file: inputPath,
    destination_path: outputDir,
  };

  await t.step("1. Initialize PromptManager", async () => {
    const manager = new PromptManager();
    assertExists(manager, "PromptManager should be initialized");
  });

  await t.step("2. Process Prompt with Variables", async () => {
    const manager = new PromptManager();
    const result = await manager.generatePrompt(promptPath, variables);
    assertExists(result, "Generated prompt should exist");
    assertEquals(typeof result.prompt, "string", "Result should be a string");
  });

  await t.step("3. Verify Variable Replacement", async () => {
    const manager = new PromptManager();
    const result = await manager.generatePrompt(promptPath, variables);
    
    // Verify schema file path is replaced
    assertEquals(
      result.prompt.includes(schemaPath),
      true,
      "Schema file path should be replaced"
    );
    
    // Verify input markdown file path is replaced
    assertEquals(
      result.prompt.includes(inputPath),
      true,
      "Input markdown file path should be replaced"
    );
    
    // Verify destination path is replaced
    assertEquals(
      result.prompt.includes(outputDir),
      true,
      "Destination path should be replaced"
    );
  });
});

Deno.test("End-to-End: Error Handling", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const promptPath = join(testDir, "templates", "basic.md");
  
  await t.step("1. Non-existent File", async () => {
    const variables: Record<string, string> = {
      schema_file: "non_existent.json",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for non-existent file");
    } catch (error) {
      assertExists(error, "Error should be thrown for non-existent file");
    }
  });

  await t.step("2. Invalid Variable Format", async () => {
    const variables: Record<string, string> = {
      schema_file: "invalid/path/with/special/chars/*.json",
      input_markdown_file: join(testDir, "input", "basic.md"),
      destination_path: join(testDir, "output"),
    };

    const manager = new PromptManager();
    try {
      await manager.generatePrompt(promptPath, variables);
      throw new Error("Should have thrown an error for invalid path format");
    } catch (error) {
      assertExists(error, "Error should be thrown for invalid path format");
    }
  });
}); 