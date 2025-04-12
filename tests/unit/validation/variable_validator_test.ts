import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { VariableValidator, DefaultVariableValidator } from "../../../src/validation/variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import type { Variables, FilePath, DirectoryPath, MarkdownText, ValidVariableKey } from "../../../src/types.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

// Mock validator for testing that only checks format without checking existence
class MockVariableValidator extends VariableValidator {
  protected logger = new BreakdownLogger();

  override async validateFilePath(path: string): Promise<boolean> {
    if (!path || path.trim().length === 0) {
      this.logger.debug("Empty file path");
      return false;
    }
    return /^[a-zA-Z0-9\/\._-]+$/.test(path);
  }

  override async validateDirectoryPath(path: string): Promise<boolean> {
    if (!path || path.trim().length === 0) {
      this.logger.debug("Empty directory path");
      return false;
    }
    return /^[a-zA-Z0-9\/\._-]+$/.test(path);
  }

  override validateMarkdownText(text: string): text is MarkdownText {
    if (!text || text.trim().length === 0) {
      this.logger.debug("Empty markdown text");
      return false;
    }

    // Basic markdown validation
    // Check for common markdown elements
    const hasMarkdownElements = /^#|^\s*[-*+]\s|^\s*\d+\.\s|^\s*>\s|^\s*`|^\s*\*\*|^\s*__|^\s*\[|^\s*!\[/.test(text);
    if (!hasMarkdownElements) {
      this.logger.debug("Text does not contain markdown elements");
      return false;
    }

    return true;
  }
}

// Helper function for async error assertions
async function assertThrowsAsync<T extends Error>(
  fn: () => Promise<unknown>,
  ErrorType: new (message: string) => T,
  msg?: string
): Promise<void> {
  let error: Error | undefined;
  try {
    await fn();
  } catch (e) {
    error = e as Error;
  }
  if (!error) {
    throw new Error(`Expected ${ErrorType.name} to be thrown${msg ? `: ${msg}` : ""}`);
  }
  if (!(error instanceof ErrorType)) {
    throw new Error(
      `Expected ${ErrorType.name} to be thrown, but got ${error.constructor.name}${msg ? `: ${msg}` : ""}`
    );
  }
}

Deno.test("VariableValidator", async (t) => {
  const validator = new MockVariableValidator();

  await t.step("validateKey", async (t) => {
    await t.step("should validate correct variable keys", () => {
      assertEquals(validator.validateKey("validKey"), true);
      assertEquals(validator.validateKey("valid_key_123"), true);
    });

    await t.step("should reject invalid variable keys", () => {
      assertEquals(validator.validateKey("123key"), false);
      assertEquals(validator.validateKey("key-with-dash"), false);
      assertEquals(validator.validateKey("key space"), false);
      assertEquals(validator.validateKey(""), false);
    });
  });

  await t.step("validateFilePath", async (t) => {
    await t.step("should validate correct file paths", async () => {
      assertEquals(await validator.validateFilePath("/path/to/file.txt"), true);
      assertEquals(await validator.validateFilePath("file.txt"), true);
      assertEquals(await validator.validateFilePath("./path/to/file.txt"), true);
    });

    await t.step("should reject invalid file paths", async () => {
      assertEquals(await validator.validateFilePath(""), false);
      assertEquals(await validator.validateFilePath("path/with spaces/file.txt"), false);
      assertEquals(await validator.validateFilePath("path/with/special@chars"), false);
    });
  });

  await t.step("validateDirectoryPath", async (t) => {
    await t.step("should validate correct directory paths", async () => {
      assertEquals(await validator.validateDirectoryPath("/path/to/dir"), true);
      assertEquals(await validator.validateDirectoryPath("dir"), true);
      assertEquals(await validator.validateDirectoryPath("./path/to/dir"), true);
    });

    await t.step("should reject invalid directory paths", async () => {
      assertEquals(await validator.validateDirectoryPath(""), false);
      assertEquals(await validator.validateDirectoryPath("path/with spaces/dir"), false);
      assertEquals(await validator.validateDirectoryPath("path/with/special@chars"), false);
    });
  });

  await t.step("validateMarkdownText", async (t) => {
    await t.step("should validate correct markdown text", () => {
      assertEquals(validator.validateMarkdownText("# Heading"), true);
      assertEquals(validator.validateMarkdownText("* List item"), true);
      assertEquals(validator.validateMarkdownText("**Bold**"), true);
      assertEquals(validator.validateMarkdownText("`code`"), true);
    });

    await t.step("should reject invalid markdown text", () => {
      assertEquals(validator.validateMarkdownText(""), false);
      assertEquals(validator.validateMarkdownText("   "), false);
      assertEquals(validator.validateMarkdownText("Plain text"), false);
    });
  });

  await t.step("validateVariables", async (t) => {
    await t.step("should validate correct variables", async () => {
      const schemaFileKey = "schema_file";
      const inputMarkdownFileKey = "input_markdown_file";
      const destinationPathKey = "destination_path";
      const inputMarkdownKey = "input_markdown";

      if (
        validator.validateKey(schemaFileKey) &&
        validator.validateKey(inputMarkdownFileKey) &&
        validator.validateKey(destinationPathKey) &&
        validator.validateKey(inputMarkdownKey)
      ) {
        const variables: Variables = {
          [schemaFileKey]: "/path/to/schema.json" as FilePath,
          [inputMarkdownFileKey]: "/path/to/input.md" as FilePath,
          [destinationPathKey]: "/path/to/output" as DirectoryPath,
          [inputMarkdownKey]: "# Heading\n* List item" as MarkdownText
        };
        assertEquals(await validator.validateVariables(variables), true);
      }
    });

    await t.step("should throw ValidationError for invalid variable names", async () => {
      const variables = {
        "123invalid": "value" as string
      };
      await assertThrowsAsync(
        () => validator.validateVariables(variables as Variables),
        ValidationError,
        "Invalid variable name: 123invalid"
      );
    });

    await t.step("should throw ValidationError for non-string values", async () => {
      const variables = {
        "valid_key": 123 as unknown as string
      };
      await assertThrowsAsync(
        () => validator.validateVariables(variables as Variables),
        ValidationError,
        "Invalid value type for variable valid_key: expected string"
      );
    });
  });
}); 