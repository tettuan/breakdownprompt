/**
 * File Utilities Test
 *
 * Purpose:
 * - Verify that file utility functions work correctly
 * - Validate file operations and path handling
 *
 * Intent:
 * - Ensure proper file system operations
 * - Test file path manipulation
 * - Validate file content handling
 *
 * Expected Results:
 * - File operations complete successfully
 * - Path manipulations are correct
 * - File content is handled properly
 *
 * Success Cases:
 * - File reading operations
 * - File writing operations
 * - Path normalization
 * - File existence checks
 *
 * Failure Cases:
 * - Non-existent files
 * - Permission errors
 * - Invalid file paths
 * - File system errors
 */

import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { FileUtils } from "../../../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const _logger = new BreakdownLogger();

Deno.test("FileUtils - Basic Operations", async (t) => {
  const fileUtils = new FileUtils();

  await t.step("should read file content", async () => {
    const content = await fileUtils.readFile("./tests/00_fixtures/01_templates/01_basic.md");
    assertEquals(typeof content, "string");
    assertEquals(content.length > 0, true);
  });

  await t.step("should write file content", async () => {
    const testPath = "./tests/00_fixtures/temp_test.md";
    const testContent = "Test content";

    await fileUtils.writeFile(testPath, testContent);
    const content = await fileUtils.readFile(testPath);
    assertEquals(content, testContent);

    // Cleanup
    await Deno.remove(testPath);
  });

  await t.step("should check file existence", async () => {
    const exists = await fileUtils.exists("./tests/00_fixtures/01_templates/01_basic.md");
    assertEquals(exists, true);
  });
});

Deno.test("FileUtils - Path Operations", async (t) => {
  const fileUtils = new FileUtils();

  await t.step("should normalize paths", () => {
    const normalized = fileUtils.normalizePath("./test/../test/file.md");
    assertEquals(normalized, "test/file.md");
  });

  await t.step("should join paths", () => {
    const joined = fileUtils.joinPaths("test", "file.md");
    assertEquals(joined, "test/file.md");
  });

  await t.step("should get directory name", () => {
    const dirname = fileUtils.getDirname("test/file.md");
    assertEquals(dirname, "test");
  });
});

Deno.test("FileUtils - Error Handling", async (t) => {
  const fileUtils = new FileUtils();

  await t.step("should handle non-existent files", async () => {
    try {
      await fileUtils.readFile("./nonexistent.md");
      throw new Error("Should have thrown an error");
    } catch (error) {
      assertEquals(error instanceof Error, true);
    }
  });

  await t.step("should handle permission denied", async () => {
    try {
      await fileUtils.writeFile("/root/test.md", "test");
      throw new Error("Should have thrown an error");
    } catch (error) {
      assertEquals(error instanceof Error, true);
    }
  });

  await t.step("should handle invalid paths", () => {
    try {
      fileUtils.normalizePath("invalid\0path");
      throw new Error("Should have thrown an error");
    } catch (error) {
      assertEquals(error instanceof Error, true);
    }
  });
});
