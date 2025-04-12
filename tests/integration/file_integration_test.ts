import { assertEquals, assertExists } from "https://deno.land/std/testing/asserts.ts";
import { BreakdownLogger } from "https://jsr.io/@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import { join } from "https://deno.land/std/path/mod.ts";

const logger = new BreakdownLogger("file_integration_test");

Deno.test("Integration: Multiple File Integration", async (t) => {
  const testDir = join(Deno.cwd(), "tests", "fixtures");
  const mainPromptPath = join(testDir, "templates", "main.md");
  const subPromptPath = join(testDir, "templates", "sub.md");
  const schemaPath = join(testDir, "schema", "test_schema.json");
  const inputPath = join(testDir, "input", "basic.md");
  const outputDir = join(testDir, "output");

  await t.step("1. Create Test Files", async () => {
    // Create main prompt template
    await Deno.writeTextFile(
      mainPromptPath,
      `# Main Template

This is the main template that includes a sub-template.

## Sub Template
{sub_template}

## Schema
{schema_file}

## Input
{input_markdown_file}

## Output
{destination_path}
`
    );

    // Create sub prompt template
    await Deno.writeTextFile(
      subPromptPath,
      `# Sub Template

This is a sub-template that can be included in the main template.

## Additional Info
{additional_info}
`
    );
  });

  await t.step("2. Process Main Template with Sub-template", async () => {
    const variables: Record<string, string> = {
      sub_template: subPromptPath,
      schema_file: schemaPath,
      input_markdown_file: inputPath,
      destination_path: outputDir,
      additional_info: "This is additional information",
    };

    const manager = new PromptManager();
    const result = await manager.generatePrompt(mainPromptPath, variables);
    
    // Verify sub-template is included
    assertEquals(
      result.prompt.includes("# Sub Template"),
      true,
      "Sub-template should be included in the output"
    );
    
    // Verify variables are replaced in both templates
    assertEquals(
      result.prompt.includes(schemaPath),
      true,
      "Schema path should be replaced in main template"
    );
    assertEquals(
      result.prompt.includes("This is additional information"),
      true,
      "Additional info should be replaced in sub-template"
    );
  });

  await t.step("3. Cleanup Test Files", async () => {
    await Deno.remove(mainPromptPath);
    await Deno.remove(subPromptPath);
  });
}); 