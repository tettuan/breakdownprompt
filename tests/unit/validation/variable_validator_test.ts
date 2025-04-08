import { assertEquals, assertThrows } from "https://deno.land/std/testing/asserts.ts";
import { DefaultVariableValidator } from "../../../src/validation/variable_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import type { Variables, FilePath, MarkdownText } from "../../../src/types/variables.ts";

Deno.test("VariableValidator", async (t) => {
  const validator = new DefaultVariableValidator();

  await t.step("validateKey", async (t) => {
    await t.step("should validate correct variable keys", () => {
      const validKeys = ["validKey", "valid_key", "ValidKey123"];
      for (const key of validKeys) {
        assertEquals(validator.validateKey(key), true);
      }
    });

    await t.step("should reject invalid variable keys", () => {
      const invalidKeys = ["123key", "key-with-dash", "key space", ""];
      for (const key of invalidKeys) {
        assertEquals(validator.validateKey(key), false);
      }
    });
  });

  await t.step("validateFilePath", async (t) => {
    await t.step("should validate correct file paths", () => {
      const validPaths = ["/path/to/file.txt", "./relative/path/file.md"];
      for (const path of validPaths) {
        assertEquals(validator.validateFilePath(path), true);
      }
    });

    await t.step("should reject invalid file paths", () => {
      const invalidPaths = ["", "path/with spaces/file.txt", "path/with/special@chars"];
      for (const path of invalidPaths) {
        assertEquals(validator.validateFilePath(path), false);
      }
    });
  });

  await t.step("validateDirectoryPath", async (t) => {
    await t.step("should validate correct directory paths", () => {
      const validPaths = ["/path/to/dir", "./relative/path/dir"];
      for (const path of validPaths) {
        assertEquals(validator.validateDirectoryPath(path), true);
      }
    });

    await t.step("should reject invalid directory paths", () => {
      const invalidPaths = ["", "path/with spaces/dir", "path/with/special@chars"];
      for (const path of invalidPaths) {
        assertEquals(validator.validateDirectoryPath(path), false);
      }
    });
  });

  await t.step("validateMarkdownText", async (t) => {
    await t.step("should validate correct markdown text", () => {
      const validTexts = ["# Title", "**Bold**", "Plain text"];
      for (const text of validTexts) {
        assertEquals(validator.validateMarkdownText(text), true);
      }
    });

    await t.step("should reject empty markdown text", () => {
      const invalidTexts = ["", "   "];
      for (const text of invalidTexts) {
        assertEquals(validator.validateMarkdownText(text), false);
      }
    });
  });

  await t.step("validateVariables", async (t) => {
    await t.step("should validate correct variables", () => {
      const schemaFileKey = "schema_file";
      const inputMarkdownKey = "input_markdown";

      if (validator.validateKey(schemaFileKey) && validator.validateFilePath("/path/to/schema.json")) {
        const variables: Record<string, string> = {
          [schemaFileKey]: "/path/to/schema.json",
        };
        assertEquals(validator.validateVariables(variables as Variables), true);
      }

      if (validator.validateKey(inputMarkdownKey) && validator.validateMarkdownText("# Title")) {
        const variables: Record<string, string> = {
          [inputMarkdownKey]: "# Title",
        };
        assertEquals(validator.validateVariables(variables as Variables), true);
      }
    });

    await t.step("should throw ValidationError for invalid variable names", () => {
      const invalidKey = "123invalid";
      const variables: Record<string, string> = {
        [invalidKey]: "/path/to/file",
      };
      assertThrows(
        () => validator.validateVariables(variables as Variables),
        ValidationError,
        "Invalid variable name: 123invalid",
      );
    });

    await t.step("should throw ValidationError for non-string values", () => {
      const validKey = "valid_key";
      const variables: Record<string, number> = {
        [validKey]: 123,
      };
      assertThrows(
        () => validator.validateVariables(variables as unknown as Variables),
        ValidationError,
        "Invalid value for variable: valid_key",
      );
    });
  });
}); 