/**
 * Structured Prompt Tests
 *
 * Purpose:
 * - Verify structured prompt parsing and generation
 * - Test section handling and variable dependencies
 * - Validate structured output generation
 *
 * Background:
 * These tests ensure structured prompts work as specified in docs/index.ja.md
 * and follow the design patterns in docs/design_pattern.ja.md.
 */

import { assertEquals, type assertExists as _assertExists, assertThrows } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../src/errors.ts";
import { cleanupTestDirs, setupTestDirs, TEST_PARAMS } from "./test_utils.ts";
import { PromptGenerator } from "../src/prompt_generator.ts";
import { PromptManager } from "../src/core/prompt_manager.ts";
import type { join as _join } from "https://deno.land/std/path/mod.ts";

const logger = new BreakdownLogger();

Deno.test("Structured Prompt Tests", async (t) => {
  logger.info("Setting up test directories");
  await setupTestDirs();

  await t.step("should parse structured prompt with sections", () => {
    const generator = new PromptGenerator();
    const template = `# Input Section
{input_markdown}

# Schema Section
{schema_file}

# Output Section
{destination_path}`;

    const result = generator.parseTemplate(template, TEST_PARAMS.variables);

    // Verify each section exists and contains the correct content
    assertEquals(result.content.includes("# Input Section"), true);
    assertEquals(result.content.includes(TEST_PARAMS.variables.input_markdown), true);
    assertEquals(result.content.includes("# Schema Section"), true);
    assertEquals(result.content.includes(TEST_PARAMS.variables.schema_file), true);
    assertEquals(result.content.includes("# Output Section"), true);
    assertEquals(result.content.includes(TEST_PARAMS.variables.destination_path), true);
  });

  await t.step("should handle section-specific variables", () => {
    const generator = new PromptGenerator();
    const template = `# Input Section
Input File: {input_markdown_file}
Content: {input_markdown}

# Schema Section
Schema File: {schema_file}

# Output Section
Output Path: {destination_path}`;

    const result = generator.parseTemplate(template, TEST_PARAMS.variables);

    // Verify section-specific variables are replaced correctly
    assertEquals(
      result.content.includes(`Input File: ${TEST_PARAMS.variables.input_markdown_file}`),
      true,
    );
    assertEquals(result.content.includes(`Content: ${TEST_PARAMS.variables.input_markdown}`), true);
    assertEquals(
      result.content.includes(`Schema File: ${TEST_PARAMS.variables.schema_file}`),
      true,
    );
    assertEquals(
      result.content.includes(`Output Path: ${TEST_PARAMS.variables.destination_path}`),
      true,
    );
  });

  await t.step("should handle empty sections", () => {
    const generator = new PromptGenerator();
    const template = `# Input Section

# Schema Section
{schema_file}

# Output Section
`;

    assertThrows(
      () => generator.parseTemplate(template, TEST_PARAMS.variables),
      ValidationError,
      "Empty section: Input Section",
    );
  });

  await t.step("should handle invalid section structure", () => {
    const generator = new PromptGenerator();
    const template = `# Input Section
{input_markdown}
## Invalid Subsection Level
{schema_file}
# Output Section
{destination_path}`;

    logger.debug("Template for invalid section structure test", { template });

    try {
      logger.debug("Attempting to parse template");
      const result = generator.parseTemplate(template, TEST_PARAMS.variables);
      logger.debug("Template parsed successfully", { result });
      throw new Error("Expected parseTemplate to throw but it didn't");
    } catch (error: unknown) {
      logger.debug("Error caught during template parsing", {
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (error instanceof ValidationError) {
        assertEquals(error.message, "Invalid section structure");
      } else {
        throw error;
      }
    }
  });

  logger.info("Cleaning up test directories");
  await cleanupTestDirs();
});

Deno.test("Structured Prompt: Section Analysis", async (t) => {
  const promptPath = "tests/fixtures/templates/structured.md";
  const schemaPath = "tests/fixtures/schema/test_schema.json";
  const inputPath = "tests/fixtures/input/basic.md";
  const outputDir = "tests/fixtures/output";

  const variables: Record<string, string> = {
    schema_file: schemaPath,
    input_markdown_file: inputPath,
    destination_path: outputDir,
  };

  await t.step("1. Section Detection", async () => {
    const manager = new PromptManager();
    const result = await manager.generatePrompt(promptPath, variables);

    // Verify section headers are preserved
    assertEquals(
      result.prompt.includes("# Section 1"),
      true,
      "Section 1 header should be preserved",
    );
    assertEquals(
      result.prompt.includes("# Section 2"),
      true,
      "Section 2 header should be preserved",
    );
  });

  await t.step("2. Variable Dependencies", async () => {
    const manager = new PromptManager();
    const result = await manager.generatePrompt(promptPath, variables);

    // Verify variables are replaced in correct sections
    const sections = result.prompt.split("# Section");

    // Section 1 should contain schema_file
    assertEquals(
      sections[1].includes(schemaPath),
      true,
      "Section 1 should contain schema file path",
    );

    // Section 2 should contain input_markdown_file
    assertEquals(
      sections[2].includes(inputPath),
      true,
      "Section 2 should contain input markdown file path",
    );
  });

  await t.step("3. Section Order Preservation", async () => {
    const manager = new PromptManager();
    const result = await manager.generatePrompt(promptPath, variables);

    // Verify sections appear in correct order
    const section1Index = result.prompt.indexOf("# Section 1");
    const section2Index = result.prompt.indexOf("# Section 2");

    assertEquals(
      section1Index < section2Index,
      true,
      "Section 1 should appear before Section 2",
    );
  });
});
