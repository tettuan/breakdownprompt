import { assertEquals, assertExists } from "@std/assert";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptManager } from "../../src/core/prompt_manager.ts";
import type { PromptParams } from "../../src/types/prompt_params.ts";

const _logger = new BreakdownLogger();

Deno.test("Basic Use Case Tests", async (t) => {
  await t.step("Single template with basic variable replacement", async () => {
    const variables = {
      input_markdown_file: "tests/fixtures/input/sample.md",
      schema_file: "tests/fixtures/schema/base.schema.json",
      output_dir: "tests/fixtures/output",
      input_markdown: "# Sample Content\nThis is a test markdown content.",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/basic_template.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("tests/fixtures/input/sample.md"), true);
    assertEquals(result.prompt.includes("tests/fixtures/schema/base.schema.json"), true);
    assertEquals(result.prompt.includes("tests/fixtures/output"), true);
    assertEquals(result.prompt.includes("# Sample Content"), true);
  });

  await t.step("Single template with file path variables", async () => {
    const variables = {
      input_file: "tests/fixtures/input/sample.md",
      output_dir: "tests/fixtures/output",
      config_file: "tests/fixtures/config/sample.json",
      schema_file: "tests/fixtures/schema/base.schema.json",
      input_markdown_file: "tests/fixtures/input/sample.md",
      input_markdown: "# Sample Content\nThis is a test markdown content.",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/file_template.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("tests/fixtures/input/sample.md"), true);
    assertEquals(result.prompt.includes("tests/fixtures/output"), true);
    assertEquals(result.prompt.includes("tests/fixtures/config/sample.json"), true);
  });

  await t.step("Single template with markdown content", async () => {
    const variables = {
      header: "# Main Header\n## Sub Header",
      body: "This is a **bold** text with *italic* content.",
      footer: "---\nFooter content",
      schema_file: "tests/fixtures/schema/base.schema.json",
      input_markdown_file: "tests/fixtures/input/sample.md",
      output_dir: "tests/fixtures/output",
      input_markdown: "# Sample Content\nThis is a test markdown content.",
    };

    const manager = new PromptManager(_logger);
    const result = await manager.generatePrompt("tests/fixtures/templates/markdown_template.md", variables);

    assertExists(result);
    assertEquals(result.success, true);
    assertEquals(result.prompt.includes("# Main Header"), true);
    assertEquals(result.prompt.includes("## Sub Header"), true);
    assertEquals(result.prompt.includes("**bold**"), true);
    assertEquals(result.prompt.includes("*italic*"), true);
    assertEquals(result.prompt.includes("---"), true);
  });
});
