import { assertEquals, assertNotEquals } from "https://deno.land/std/testing/asserts.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import {
  ValidVariableKey,
  FilePath,
  DirectoryPath,
  MarkdownText,
  Variables,
  VariableValidator,
} from "../../../src/types/variables.ts";

const logger = new BreakdownLogger();

// Mock validator for testing
class MockVariableValidator implements VariableValidator {
  validateKey(key: string): key is ValidVariableKey {
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key);
  }

  async validateFilePath(path: string): Promise<boolean> {
    logger.debug(`Validating file path: ${path}`);
    return path.length > 0;
  }

  async validateDirectoryPath(path: string): Promise<boolean> {
    logger.debug(`Validating directory path: ${path}`);
    return path.length > 0;
  }

  validateMarkdownText(text: string): text is MarkdownText {
    logger.debug(`Validating markdown text: ${text}`);
    return text.length > 0;
  }

  async validateVariables(variables: Variables): Promise<boolean> {
    logger.debug(`Validating variables: ${JSON.stringify(variables)}`);
    return true;
  }
}

Deno.test("Variable Types - ValidVariableKey", async (t) => {
  const validator = new MockVariableValidator();

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

Deno.test("Variable Types - FilePath", async (t) => {
  const validator = new MockVariableValidator();

  await t.step("should validate file paths", async () => {
    const validPaths = ["/path/to/file.txt", "./relative/path/file.md"];
    for (const path of validPaths) {
      const isValid = await validator.validateFilePath(path);
      assertEquals(isValid, true);
    }
  });

  await t.step("should reject empty file paths", async () => {
    const isValid = await validator.validateFilePath("");
    assertEquals(isValid, false);
  });
});

Deno.test("Variable Types - DirectoryPath", async (t) => {
  const validator = new MockVariableValidator();

  await t.step("should validate directory paths", async () => {
    const validPaths = ["/path/to/dir", "./relative/path/dir"];
    for (const path of validPaths) {
      const isValid = await validator.validateDirectoryPath(path);
      assertEquals(isValid, true);
    }
  });

  await t.step("should reject empty directory paths", async () => {
    const isValid = await validator.validateDirectoryPath("");
    assertEquals(isValid, false);
  });
});

Deno.test("Variable Types - MarkdownText", async (t) => {
  const validator = new MockVariableValidator();

  await t.step("should validate markdown text", () => {
    const validTexts = ["# Title", "**Bold**", "Plain text"];
    for (const text of validTexts) {
      assertEquals(validator.validateMarkdownText(text), true);
    }
  });

  await t.step("should reject empty markdown text", () => {
    assertEquals(validator.validateMarkdownText(""), false);
  });
});

Deno.test("Variable Types - Variables", async (t) => {
  const validator = new MockVariableValidator();

  await t.step("should allow partial variables", async () => {
    const schemaFileKey = "schema_file";
    const inputMarkdownKey = "input_markdown";

    if (validator.validateKey(schemaFileKey)) {
      const isValidPath = await validator.validateFilePath("/path/to/schema.json");
      if (isValidPath) {
        const variables: Variables = {
          [schemaFileKey]: "/path/to/schema.json" as FilePath,
        };
        assertNotEquals(variables, undefined);
      }
    }

    if (validator.validateKey(inputMarkdownKey)) {
      const variables: Variables = {
        [inputMarkdownKey]: "# Title" as MarkdownText,
      };
      assertNotEquals(variables, undefined);
    }
  });
}); 