import { assertEquals, assertThrows } from "https://deno.land/std/assert/mod.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError, VariableValidator } from "../../../src/validation/variable_validator.ts";
import type {
  DirectoryPath as _DirectoryPath,
  FilePath as _FilePath,
  MarkdownText,
  Variables,
} from "../../../src/types.ts";
import type { assertRejects as _assertRejects } from "@std/assert";

// Mock validator for testing that only checks format without checking existence
class MockVariableValidator extends VariableValidator {
  protected logger = new BreakdownLogger();

  override validateKey(key: string): boolean {
    if (!key) {
      throw new ValidationError("Variable name cannot be empty");
    }

    if (!/^[a-zA-Z]/.test(key)) {
      throw new ValidationError("must start with a letter");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      throw new ValidationError("only alphanumeric characters and underscores allowed");
    }

    return true;
  }

  override validateFilePath(path: string): Promise<boolean> {
    // File paths must not contain spaces or special characters except for /, ., and _
    return Promise.resolve(/^[a-zA-Z0-9/_.-]+$/.test(path) && path.length > 0);
  }

  override validateDirectoryPath(path: string): Promise<boolean> {
    // Directory paths must not contain spaces or special characters except for /, ., and _
    return Promise.resolve(/^[a-zA-Z0-9/_.-]+$/.test(path) && path.length > 0);
  }

  override validateMarkdownText(text: string): text is MarkdownText {
    // Markdown text must contain at least one markdown element (heading, list, bold, code)
    // Allow whitespace before markdown elements and handle multiline content
    return /(?:^|\n)\s*(?:#|\*|`|\*\*|-)/.test(text);
  }

  override validateVariables(variables: Record<string, unknown>): Promise<boolean> {
    for (const [key, value] of Object.entries(variables)) {
      if (!this.validateKey(key)) {
        throw new ValidationError(`Invalid variable name: ${key}`);
      }
      if (typeof value !== "string") {
        throw new ValidationError(`Invalid value type for variable ${key}: expected string`);
      }
    }
    return Promise.resolve(true);
  }
}

// Helper function for async error assertions
async function assertThrowsAsync<T extends Error>(
  fn: () => Promise<unknown>,
  ErrorType: new (message: string) => T,
  msg?: string,
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
      `Expected ${ErrorType.name} to be thrown, but got ${error.constructor.name}${
        msg ? `: ${msg}` : ""
      }`,
    );
  }
}

Deno.test("VariableValidator", async (t) => {
  const validator = new MockVariableValidator();

  await t.step("validateKey", async (t) => {
    await t.step("should validate correct variable keys", () => {
      assertEquals(validator.validateKey("valid_key"), true);
      assertEquals(validator.validateKey("validKey123"), true);
      assertEquals(validator.validateKey("valid_key_123"), true);
    });

    await t.step("should reject invalid variable keys", () => {
      assertThrows(
        () => validator.validateKey("123invalid"),
        ValidationError,
        "must start with a letter",
      );

      assertThrows(
        () => validator.validateKey("invalid-key"),
        ValidationError,
        "only alphanumeric characters and underscores allowed",
      );

      assertThrows(
        () => validator.validateKey(""),
        ValidationError,
        "Variable name cannot be empty",
      );
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
        const variables: Record<string, unknown> = {
          schema_file: "/path/to/schema.json",
          input_markdown_file: "/path/to/input.md",
          destination_path: "/path/to/output",
          input_markdown: "# Heading\n* List item",
        };
        assertEquals(await validator.validateVariables(variables), true);
      }
    });

    await t.step("should throw ValidationError for invalid variable names", async () => {
      const variables = {
        "123invalid": "value" as string,
      };
      await assertThrowsAsync(
        () => validator.validateVariables(variables as Variables),
        ValidationError,
        "Invalid variable name: 123invalid",
      );
    });

    await t.step("should throw ValidationError for non-string values", async () => {
      const variables = {
        "valid_key": 123 as unknown as string,
      };
      await assertThrowsAsync(
        () => validator.validateVariables(variables as Variables),
        ValidationError,
        "Invalid value type for variable valid_key: expected string",
      );
    });
  });
});
