import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const logger = new BreakdownLogger();

Deno.test("Integration: Multiple File Integration", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const mainPromptPath = join(testDir, "templates", "main.md");
  const schemaPath = join(testDir, "schema", "test_schema.json");
  const inputPath = join(testDir, "input", "basic.md");
  const outputDir = join(testDir, "output");

  await t.step("1. Create Test Files", async () => {
    // Create main prompt template
    await Deno.writeTextFile(
      mainPromptPath,
      `# Main Template

This is the main template.

## Schema
{schema_file}

## Input
{input_markdown_file}

## Output
{destination_path}
`
    );
  });

  await t.step("2. Process Template", async () => {
    const variables: Record<string, string> = {
      schema_file: schemaPath,
      input_markdown_file: inputPath,
      destination_path: outputDir,
    };

    const manager = new PromptManager(logger);
    const result = await manager.generatePrompt(mainPromptPath, variables);
    
    // Verify variables are replaced
    assertEquals(
      result.prompt.includes(schemaPath),
      true,
      "Schema path should be replaced in template"
    );
    assertEquals(
      result.prompt.includes(inputPath),
      true,
      "Input path should be replaced in template"
    );
    assertEquals(
      result.prompt.includes(outputDir),
      true,
      "Output path should be replaced in template"
    );
  });

  await t.step("3. Cleanup Test Files", async () => {
    await Deno.remove(mainPromptPath);
  });
}); 