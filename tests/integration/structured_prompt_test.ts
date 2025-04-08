import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams } from "../../src/types/prompt_params.ts";

const _logger = new BreakdownLogger();

Deno.test("Structured Prompt Processing Tests", async (t) => {
  await t.step("Section structure parsing", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Section Test\nThis is a section test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/valid_prompt.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Check that section headers are preserved
    const content = result.prompt;
    const sections = content.split("##");
    assertEquals(sections.length > 1, true);

    // Verify that each section has the expected structure
    for (const section of sections) {
      if (section.includes("Input Section")) {
        assertEquals(section.includes(variables.input_markdown), true);
      } else if (section.includes("Schema Section")) {
        assertEquals(section.includes(variables.schema_file), true);
      } else if (section.includes("Output Section")) {
        assertEquals(section.includes(variables.output_dir), true);
      }
    }
  });

  await t.step("Variable dependency handling", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Dependency Test\nThis is a dependency test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/valid_prompt.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Check that dependent variables are properly handled
    const content = result.prompt;
    const inputSection = content.split("## Input Section")[1];
    const schemaSection = content.split("## Schema Section")[1];
    const outputSection = content.split("## Output Section")[1];

    // Verify that variables are properly referenced in their sections
    assertExists(inputSection);
    assertExists(schemaSection);
    assertExists(outputSection);

    // Check that input section references input_markdown and input_markdown_file
    assertEquals(inputSection.includes(variables.input_markdown), true);
    assertEquals(inputSection.includes(variables.input_markdown_file), true);

    // Check that schema section references schema_file
    assertEquals(schemaSection.includes(variables.schema_file), true);

    // Check that output section references output_dir
    assertEquals(outputSection.includes(variables.output_dir), true);
  });

  await t.step("Nested section structure", async () => {
    const variables = {
      schema_file: "tests/fixtures/schema/test_schema.json",
      input_markdown: "# Nested Structure Test\nThis is a nested structure test.",
      input_markdown_file: "tests/fixtures/input/basic.md",
      output_dir: "tests/fixtures/output",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/valid_prompt.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    // Check that nested sections are properly handled
    const content = result.prompt;
    const nestedSections = content.split("###");
    assertEquals(nestedSections.length > 1, true);

    // Verify that variables are properly replaced in nested sections
    for (const section of nestedSections) {
      if (section.includes("Subsection 1")) {
        assertEquals(section.includes(variables.input_markdown_file), true);
        assertEquals(section.includes(variables.schema_file), true);
      } else if (section.includes("Subsection 2")) {
        assertEquals(section.includes(variables.output_dir), true);
        assertEquals(section.includes(variables.input_markdown), true);
      }
    }
  });
});
