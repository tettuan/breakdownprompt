/**
 * Template → Variable Pipeline Integration Test
 *
 * Purpose:
 * - Verify TemplateLoader → VariableReplacer pipeline with REAL validators
 * - Test end-to-end flow using temp files
 * - Ensure error propagation across pipeline stages
 */

import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { TemplateLoader } from "../../src/core/template_loader.ts";
import { VariableReplacer } from "../../src/core/variable_replacer.ts";
import { ValidationError } from "../../src/errors.ts";
import { PathValidator } from "../../src/validation/path_validator.ts";
import { VariableValidator } from "../../src/validation/variable_validator.ts";
import { FileUtils } from "../../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger("prompt");

let templateLoader: TemplateLoader;
let variableReplacer: VariableReplacer;
let tmpDir: string;

async function setupPipeline(): Promise<void> {
  const pathValidator = new PathValidator();
  const fileUtils = new FileUtils();
  const variableValidator = new VariableValidator();

  templateLoader = new TemplateLoader(pathValidator, fileUtils, logger);
  variableReplacer = new VariableReplacer(logger, variableValidator);

  tmpDir = await Deno.makeTempDir();
}

async function cleanupPipeline(): Promise<void> {
  try {
    await Deno.remove(tmpDir, { recursive: true });
  } catch (_e) {
    // ignore
  }
}

async function writeTempTemplate(
  filename: string,
  content: string,
): Promise<string> {
  const path = `${tmpDir}/${filename}`;
  await Deno.writeTextFile(path, content);
  return path;
}

Deno.test({
  name: "Pipeline - file template → full replace",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      const templatePath = await writeTempTemplate(
        "full.md",
        "Hello {schema_file}! Output to {input_text}.",
      );
      const loaded = await templateLoader.load(templatePath);
      const detected = variableReplacer.extractVariables(loaded.content);
      assertEquals(detected.includes("schema_file"), true);
      assertEquals(detected.includes("input_text"), true);

      const result = variableReplacer.replaceAll(loaded.content, {
        schema_file: "my_schema.json",
        input_text: "my_input.txt",
      });
      assertEquals(result.content, "Hello my_schema.json! Output to my_input.txt.");
      assertEquals(result.replaced.length, 2);
      assertEquals(result.remaining.length, 0);
    } finally {
      await cleanupPipeline();
    }
  },
});

Deno.test({
  name: "Pipeline - inline template → replace",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      const loaded = await templateLoader.load("Welcome {schema_file}!");
      assertEquals(loaded.templatePath, "inline");

      const result = variableReplacer.replaceAll(loaded.content, {
        schema_file: "data.json",
      });
      assertEquals(result.content, "Welcome data.json!");
    } finally {
      await cleanupPipeline();
    }
  },
});

Deno.test({
  name: "Pipeline - partial replace tracking",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      const templatePath = await writeTempTemplate(
        "partial.md",
        "{schema_file} and {input_text} and {input_text_file}",
      );
      const loaded = await templateLoader.load(templatePath);
      const result = variableReplacer.replaceAll(loaded.content, {
        schema_file: "replaced_schema",
      });
      assertEquals(result.content, "replaced_schema and {input_text} and {input_text_file}");
      assertEquals(result.replaced, ["schema_file"]);
      assertEquals(result.remaining.length, 2);
      assertEquals(result.remaining.includes("input_text"), true);
      assertEquals(result.remaining.includes("input_text_file"), true);
    } finally {
      await cleanupPipeline();
    }
  },
});

Deno.test({
  name: "Pipeline - no-variable template passes through",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      const templatePath = await writeTempTemplate(
        "novar.md",
        "Plain text with no variables.",
      );
      const loaded = await templateLoader.load(templatePath);
      const detected = variableReplacer.extractVariables(loaded.content);
      assertEquals(detected.length, 0);

      const result = variableReplacer.replaceAll(loaded.content, {});
      assertEquals(result.content, "Plain text with no variables.");
      assertEquals(result.replaced.length, 0);
      assertEquals(result.remaining.length, 0);
    } finally {
      await cleanupPipeline();
    }
  },
});

Deno.test({
  name: "Pipeline - load failure → replacer not called",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      await assertRejects(
        () => templateLoader.load(`${tmpDir}/nonexistent.md`),
        ValidationError,
        "Template not found",
      );
    } finally {
      await cleanupPipeline();
    }
  },
});

Deno.test({
  name: "Pipeline - empty template error",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      const templatePath = await writeTempTemplate("empty.md", "");
      await assertRejects(
        () => templateLoader.load(templatePath),
        ValidationError,
        "Template is empty",
      );
    } finally {
      await cleanupPipeline();
    }
  },
});

Deno.test({
  name: "Pipeline - invalid key error at replace stage",
  async fn(): Promise<void> {
    await setupPipeline();
    try {
      const loaded = await templateLoader.load("Hello {schema_file}!");
      assertThrows(
        () => variableReplacer.validateKeys({ "": "value" }),
        ValidationError,
        "Invalid variable name",
      );
      // But the template loads successfully
      assertEquals(loaded.content, "Hello {schema_file}!");
    } finally {
      await cleanupPipeline();
    }
  },
});
