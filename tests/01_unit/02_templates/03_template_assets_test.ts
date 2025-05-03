/**
 * Template Assets Unit Test
 *
 * Purpose:
 * - Verify the functionality of template assets
 * - Test template file loading and validation
 * - Ensure proper handling of template variables
 */

import { assertEquals, assertRejects } from "jsr:@std/testing@^0.220.1/asserts";
import { TemplateFile } from "../../../src/core/template_file.ts";
import { FileUtils } from "../../../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { TextValidator } from "../../../src/validation/markdown_validator.ts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import type { TextContent } from "../../../src/types.ts";

const logger = new BreakdownLogger();
const textValidator = new TextValidator();
const _pathValidator = new PathValidator();
const _variableValidator = new VariableValidator();
const fileUtils = new FileUtils();

// Pre-processing and Preparing Part
let templateFile: TemplateFile;
const testTemplatePath = "tests/00_fixtures/01_templates/01_basic.md";
const testOutputPath = "tests/00_fixtures/02_output/test_output.md";

async function setupTest() {
  templateFile = new TemplateFile(fileUtils, logger);
  // Ensure clean state
  await cleanupTest();
  // Create test output directory if it doesn't exist
  try {
    await Deno.mkdir("tests/00_fixtures/02_output", { recursive: true });
  } catch (_error) {
    // Ignore if directory already exists
  }
}

async function cleanupTest() {
  try {
    await Deno.remove(testOutputPath);
  } catch (_error) {
    // Ignore if file doesn't exist
  }
}

// Main Test
Deno.test({
  name: "TemplateFile - Basic template operations",
  async fn(t) {
    await setupTest();

    await t.step("should load template from file", async () => {
      logger.debug("Testing template loading");
      const content = await templateFile.read(testTemplatePath);
      assertEquals(content.includes("Hello"), true);
      assertEquals(content.includes("{name}"), true);
    });

    await t.step("should handle missing template file", async () => {
      logger.debug("Testing missing template handling");
      await assertRejects(
        async () => {
          await templateFile.read("tests/00_fixtures/01_templates/nonexistent.md");
        },
        Error,
        "Template not found: tests/00_fixtures/01_templates/nonexistent.md",
      );
    });

    await t.step("should handle invalid template file", () => {
      logger.debug("Testing invalid template handling");
      const invalidTemplate = "Hello {name} with {invalid-name}";
      assertEquals(
        textValidator.validateText(invalidTemplate as TextContent),
        true,
      );
    });

    await t.step("should handle empty template file", () => {
      logger.debug("Testing empty template handling");
      const emptyTemplate = "";
      assertEquals(
        textValidator.validateText(emptyTemplate as TextContent),
        true,
      );
    });

    await cleanupTest();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
