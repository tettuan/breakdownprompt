/**
 * Prompt Manager Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the PromptManager class
 * - Test prompt generation with optional variables
 * - Ensure proper handling of variable validation
 *
 * 仕様書参照:
 * - [変数の関係性](./docs/variables.ja.md#変数の関係性)
 * - [変数の型定義](./docs/type_of_variables.ja.md)
 * - [プロンプト管理システム仕様書](./docs/index.ja.md#プロンプト管理システム仕様書)
 */

import { assertEquals, assertRejects } from "@std/assert";
import { PromptManager } from "../../../src/core/prompt_manager.ts";
import { FileUtils } from "../../../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { TextValidator } from "../../../src/validation/markdown_validator.ts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import { VariableValidator } from "../../../src/validation/variable_validator.ts";
import type { TextContent } from "../../../src/types/variables.ts";

const logger = new BreakdownLogger();
const textValidator = new TextValidator();
const _pathValidator = new PathValidator();
const _variableValidator = new VariableValidator();
const _fileUtils = new FileUtils();

// Pre-processing and Preparing Part
let promptManager: PromptManager;
const testTemplatePath = "tests/00_fixtures/01_templates/01_basic.md";
const testOutputPath = "tests/00_fixtures/02_output/test_output.md";

async function setupTest(): Promise<void> {
  promptManager = new PromptManager(textValidator, undefined, undefined, undefined, logger);
  // Ensure clean state
  await cleanupTest();
  // Create test output directory if it doesn't exist
  try {
    await Deno.mkdir("tests/00_fixtures/02_output", { recursive: true });
  } catch (_error) {
    // Ignore if directory already exists
  }
}

async function cleanupTest(): Promise<void> {
  try {
    await Deno.remove(testOutputPath);
  } catch (_error) {
    // Ignore if file doesn't exist
  }
}

// Main Test
Deno.test({
  name: "PromptManager - Basic prompt generation",
  async fn(t): Promise<void> {
    await setupTest();

    /**
     * 完全成功ケースのテスト
     * 仕様: [変数の関係性](./docs/variables.ja.md#variables-とテンプレート変数の関係)
     * 意図: 全ての変数が正しく置換されることを確認
     */
    await t.step("should generate a prompt from a valid template file", async () => {
      logger.debug("Testing prompt generation with valid template file");
      const result = await promptManager.generatePrompt(
        testTemplatePath,
        { name: "test" },
      );
      assertEquals(result.success, true);
      if (result.success && result.content) {
        assertEquals(result.content.includes("Hello, test!"), true);
        assertEquals(result.templatePath, testTemplatePath);
        assertEquals(result.variables.detected.includes("name"), true);
        assertEquals(result.variables.replaced.includes("name"), true);
        assertEquals(result.variables.remaining.length, 0);
      }
    });

    /**
     * テンプレートファイルが存在しないケースのテスト
     * 仕様: [プロンプト管理システム仕様書](./docs/index.ja.md#33-エラーハンドリング)
     * 意図: ファイルが見つからない場合のエラー処理を確認
     */
    await t.step("should handle missing template file", async () => {
      logger.debug("Testing prompt generation with missing template file");
      const result = await promptManager.generatePrompt(
        "tests/00_fixtures/01_templates/nonexistent.md",
        { name: "test" },
      );
      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(
          result.error,
          "Template not found: tests/00_fixtures/01_templates/nonexistent.md",
        );
        assertEquals(result.templatePath, "tests/00_fixtures/01_templates/nonexistent.md");
        assertEquals(result.variables.detected.length, 0);
        assertEquals(result.variables.replaced.length, 0);
        assertEquals(result.variables.remaining.length, 0);
      }
    });

    /**
     * 空の変数ケースのテスト
     * 仕様: [変数の関係性](./docs/variables.ja.md#variables-とテンプレート変数の関係)
     * 意図: 変数が空の場合でもテンプレートは正常に処理されることを確認
     */
    await t.step("should handle empty variables", async () => {
      logger.debug("Testing prompt generation with empty variables");
      const result = await promptManager.generatePrompt(
        testTemplatePath,
        {},
      );
      assertEquals(result.success, true);
      if (result.success && result.content) {
        assertEquals(result.content.includes("{name}"), true);
        assertEquals(result.templatePath, testTemplatePath);
        assertEquals(result.variables.detected.includes("name"), true);
        assertEquals(result.variables.replaced.length, 0);
        assertEquals(result.variables.remaining.includes("name"), true);
      }
    });

    /**
     * 部分的な変数置換のテスト
     * 仕様: [変数の関係性](./docs/variables.ja.md#variables-とテンプレート変数の関係)
     * 意図: 一部の変数のみが置換されるケースを確認
     */
    await t.step("should handle partial variables", async () => {
      logger.debug("Testing prompt generation with partial variables");
      const templateStr = "Hello {name}! Your age is {age}.";
      const variables = { name: "test" };

      logger.debug("Template content", { templateStr });
      logger.debug("Variables provided", { variables });

      // Validate template content
      textValidator.validateText(templateStr);
      const template = templateStr as TextContent;

      const result = await promptManager.generatePrompt(template, variables);
      logger.debug("Result", { result });

      assertEquals(result.success, true);
      if (result.success) {
        assertEquals(result.content, "Hello test! Your age is {age}.");
        assertEquals(result.templatePath, "inline");
        assertEquals(result.variables.detected.includes("name"), true);
        assertEquals(result.variables.detected.includes("age"), true);
        assertEquals(result.variables.replaced.includes("name"), true);
        assertEquals(result.variables.remaining.includes("age"), true);
        assertEquals(result.variables.remaining.length, 1);
      }
    });

    /**
     * ハイフン付き変数名のテスト
     * 仕様: [変数の関係性](./docs/variables.ja.md#variables-とテンプレート変数の関係)
     * 意図: ハイフン付き変数名が正常に処理されることを確認
     */
    await t.step("should handle hyphenated variable names", async () => {
      logger.debug("Testing prompt generation with hyphenated variable names");
      logger.debug("Using template path", { testTemplatePath });
      logger.debug("Using hyphenated variable name", { variables: { "hyphenated-name": "test" } });

      const result = await promptManager.generatePrompt(
        testTemplatePath,
        { "hyphenated-name": "test", name: "World" },
      );

      logger.debug("Result from prompt generation", { result });

      assertEquals(result.success, true);
    });

    await cleanupTest();
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

// --- writePrompt tests ---

Deno.test({
  name: "PromptManager - writePrompt",
  async fn(t): Promise<void> {
    const tmpDir = await Deno.makeTempDir();

    await t.step("writes content to file", async () => {
      const pm = new PromptManager(textValidator, undefined, undefined, undefined, logger);
      const dest = `${tmpDir}/write_test.md`;
      await pm.writePrompt("Hello prompt!", dest);
      const content = await Deno.readTextFile(dest);
      assertEquals(content, "Hello prompt!");
    });

    await t.step("throws for nonexistent directory", async () => {
      const pm = new PromptManager(textValidator, undefined, undefined, undefined, logger);
      await assertRejects(
        () => pm.writePrompt("content", `${tmpDir}/no_such_dir/file.md`),
      );
    });

    await t.step("overwrites existing file", async () => {
      const pm = new PromptManager(textValidator, undefined, undefined, undefined, logger);
      const dest = `${tmpDir}/overwrite_test.md`;
      await pm.writePrompt("first", dest);
      await pm.writePrompt("second", dest);
      const content = await Deno.readTextFile(dest);
      assertEquals(content, "second");
    });

    await Deno.remove(tmpDir, { recursive: true });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
