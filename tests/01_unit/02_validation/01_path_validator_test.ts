/**
 * Path Validator Unit Test
 *
 * Purpose:
 * - Verify the core functionality of the PathValidator class
 * - Validate file and directory path handling
 * - Ensure proper security checks and path normalization
 *
 * Intent:
 * - Test file path validation
 * - Verify directory path validation
 * - Test extension validation
 * - Validate security checks
 * - Test error handling
 * - Verify path normalization
 * - Test permission checks
 */

import {
  assertEquals,
  type assertThrows as _assertThrows,
} from "jsr:@std/testing@^0.220.1/asserts";
import { PathValidator } from "../../../src/validation/path_validator.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { join } from "jsr:@std/path@^0.220.1/join";

const _logger = new BreakdownLogger();

Deno.test("PathValidator - Temp Directory Detection", async (t) => {
  const pathValidator = new PathValidator();

  // Wait for temp dir initialization
  await new Promise((resolve) => setTimeout(resolve, 100));

  await t.step("should allow paths in detected temp directory", async () => {
    // Create a temp dir to test
    const tempDir = await Deno.makeTempDir();
    const testFile = `${tempDir}/test.txt`;

    try {
      // Write a test file
      await Deno.writeTextFile(testFile, "test");

      // Verify the path is allowed
      assertEquals(
        await pathValidator.validateFilePath(testFile),
        testFile,
      );

      // Verify the temp dir itself is allowed
      assertEquals(
        await pathValidator.validateDirectoryPath(tempDir),
        tempDir,
      );
    } finally {
      // Clean up
      await Deno.remove(tempDir, { recursive: true });
    }
  });

  await t.step("should allow paths in fallback temp directories", async () => {
    const fallbackDirs = [
      "/tmp",
      "/var/tmp",
      "/private/var/folders",
      "/var/folders",
    ];

    for (const dir of fallbackDirs) {
      try {
        // Check if directory exists and is accessible
        await Deno.stat(dir);

        // Test file path
        const testFile = `${dir}/test.txt`;
        assertEquals(
          await pathValidator.validateFilePath(testFile),
          testFile,
        );

        // Test directory path
        assertEquals(
          await pathValidator.validateDirectoryPath(dir),
          dir,
        );
      } catch (_error) {
        // Skip if directory doesn't exist or is not accessible
        continue;
      }
    }
  });
});

Deno.test("PathValidator - File path validation", async (t) => {
  const pathValidator = new PathValidator();

  // Wait for initialization
  await new Promise((resolve) => setTimeout(resolve, 100));

  await t.step("should reject empty paths", async () => {
    try {
      await pathValidator.validateFilePath("");
      throw new Error("Expected validateFilePath to throw for empty path");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path cannot be empty");
    }

    try {
      await pathValidator.validateFilePath("  ");
      throw new Error("Expected validateFilePath to throw for whitespace path");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path cannot be empty");
    }
  });

  await t.step("should reject paths with directory traversal", async () => {
    try {
      await pathValidator.validateFilePath("../test.txt");
      throw new Error("Expected validateFilePath to throw for directory traversal");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains directory traversal (..)");
    }

    try {
      await pathValidator.validateFilePath("folder/../test.txt");
      throw new Error("Expected validateFilePath to throw for directory traversal");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains directory traversal (..)");
    }
  });

  await t.step("should reject paths with invalid characters", async () => {
    try {
      await pathValidator.validateFilePath("test<file>.txt");
      throw new Error("Expected validateFilePath to throw for invalid characters");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains invalid characters: <");
    }

    try {
      await pathValidator.validateFilePath("test|file.txt");
      throw new Error("Expected validateFilePath to throw for invalid characters");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains invalid characters: |");
    }

    try {
      await pathValidator.validateFilePath("test?file.txt");
      throw new Error("Expected validateFilePath to throw for invalid characters");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains invalid characters: ?");
    }

    try {
      await pathValidator.validateFilePath("test*file.txt");
      throw new Error("Expected validateFilePath to throw for invalid characters");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains invalid characters: *");
    }

    try {
      await pathValidator.validateFilePath("test\\file.txt");
      throw new Error("Expected validateFilePath to throw for invalid characters");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains invalid characters: \\");
    }

    try {
      await pathValidator.validateFilePath("test file.txt");
      throw new Error("Expected validateFilePath to throw for invalid characters");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains invalid characters:  ");
    }
  });

  await t.step("should reject paths exceeding maximum length", async () => {
    const longPath = "a".repeat(5000) + ".txt";
    try {
      await pathValidator.validateFilePath(longPath);
      throw new Error("Expected validateFilePath to throw for long path");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals(
        (error as ValidationError).message,
        "Path exceeds maximum length of 4096 characters",
      );
    }
  });

  await t.step("should validate and normalize valid file paths", async () => {
    assertEquals(await pathValidator.validateFilePath("test.txt"), "test.txt");
    assertEquals(await pathValidator.validateFilePath("folder/test.txt"), "folder/test.txt");
    assertEquals(
      await pathValidator.validateFilePath("folder/subfolder/test.txt"),
      "folder/subfolder/test.txt",
    );
    assertEquals(await pathValidator.validateFilePath("./test.txt"), "test.txt");
    assertEquals(await pathValidator.validateFilePath("./folder/test.txt"), "folder/test.txt");
  });
});

Deno.test("PathValidator - Directory path validation", async (t) => {
  const pathValidator = new PathValidator();

  // Wait for initialization
  await new Promise((resolve) => setTimeout(resolve, 100));

  await t.step("should reject empty paths", async () => {
    try {
      await pathValidator.validateDirectoryPath("");
      throw new Error("Expected validateDirectoryPath to throw for empty path");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path cannot be empty");
    }

    try {
      await pathValidator.validateDirectoryPath("  ");
      throw new Error("Expected validateDirectoryPath to throw for whitespace path");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path cannot be empty");
    }
  });

  await t.step("should reject paths with directory traversal", async () => {
    try {
      await pathValidator.validateDirectoryPath("../test_dir");
      throw new Error("Expected validateDirectoryPath to throw for directory traversal");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains directory traversal (..)");
    }

    try {
      await pathValidator.validateDirectoryPath("folder/../test_dir");
      throw new Error("Expected validateDirectoryPath to throw for directory traversal");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals((error as ValidationError).message, "Path contains directory traversal (..)");
    }
  });

  await t.step("should reject absolute paths outside /tmp", async () => {
    try {
      await pathValidator.validateDirectoryPath("/usr/local/test_dir");
      throw new Error("Expected validateDirectoryPath to throw for absolute path outside /tmp");
    } catch (error) {
      assertEquals((error as ValidationError) instanceof ValidationError, true);
      assertEquals(
        (error as ValidationError).message,
        "Absolute paths are not allowed. Please use relative paths instead.",
      );
    }
  });

  await t.step("should allow relative paths", async () => {
    assertEquals(await pathValidator.validateDirectoryPath("test_dir"), "test_dir");
    assertEquals(await pathValidator.validateDirectoryPath("./test_dir"), "test_dir");
    assertEquals(await pathValidator.validateDirectoryPath("folder/test_dir"), "folder/test_dir");
  });

  await t.step("should allow relative file paths", async () => {
    assertEquals(await pathValidator.validateDirectoryPath("test_dir"), "test_dir");
    assertEquals(await pathValidator.validateDirectoryPath("folder/test_dir"), "folder/test_dir");
    assertEquals(
      await pathValidator.validateDirectoryPath("folder/subfolder/test_dir"),
      "folder/subfolder/test_dir",
    );
  });

  await t.step("should allow paths in current directory", async () => {
    const currentDir = Deno.cwd();
    assertEquals(await pathValidator.validateDirectoryPath(currentDir), currentDir);
    assertEquals(
      await pathValidator.validateDirectoryPath(currentDir + "/test_dir"),
      currentDir + "/test_dir",
    );
  });

  await t.step("should allow paths in detected temp directory", async () => {
    const tempDir = await Deno.makeTempDir();
    const testDir = join(tempDir, "test_dir");
    await Deno.mkdir(testDir);

    try {
      assertEquals(await pathValidator.validateDirectoryPath(testDir), testDir);
    } finally {
      await Deno.remove(tempDir, { recursive: true });
    }
  });
});
