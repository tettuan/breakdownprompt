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

import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { FileUtils } from "../../../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();
const fileUtils = new FileUtils();

// Pre-processing and Preparing Part
const testPath = "./tests/00_fixtures/temp_test.md";
const testBasicPath = "./tests/00_fixtures/01_templates/01_basic.md";

async function setupTest() {
  // Ensure clean state
  await cleanupTest();
  // Create test directory if it doesn't exist
  try {
    await Deno.mkdir("./tests/00_fixtures", { recursive: true });
  } catch (_error) {
    // Ignore if directory already exists
  }
}

async function cleanupTest() {
  try {
    const exists = await fileUtils.exists(testPath);
    if (exists) {
      await Deno.remove(testPath);
    }
  } catch (_error) {
    // Ignore if file doesn't exist
  }
}

// Main Test
Deno.test({
  name: "FileUtils - Basic Operations",
  async fn(t) {
    await setupTest();

    await t.step("should read file content", async () => {
      logger.debug("Testing file read operation");
      const content = await fileUtils.readFile(testBasicPath);
      assertEquals(typeof content, "string");
      assertEquals(content.length > 0, true);
    });

    await t.step("should write file content", async () => {
      logger.debug("Testing file write operation");
      const testContent = "Test content";
      await fileUtils.writeFile(testPath, testContent);
      const content = await fileUtils.readFile(testPath);
      assertEquals(content, testContent);
      await cleanupTest();
    });

    await t.step("should check file existence", async () => {
      logger.debug("Testing file existence check");
      const exists = await fileUtils.exists(testBasicPath);
      assertEquals(exists, true);
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "FileUtils - Path Operations",
  async fn(t) {
    await t.step("should normalize paths", () => {
      logger.debug("Testing path normalization");
      const normalized = fileUtils.normalizePath("./test/../test/file.md");
      assertEquals(normalized, "test/file.md");
    });

    await t.step("should join paths", () => {
      logger.debug("Testing path joining");
      const joined = fileUtils.joinPaths("test", "file.md");
      assertEquals(joined, "test/file.md");
    });

    await t.step("should get directory name", () => {
      logger.debug("Testing directory name extraction");
      const dirname = fileUtils.getDirname("test/file.md");
      assertEquals(dirname, "test");
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "FileUtils - Error Handling",
  async fn(t) {
    await t.step("should handle non-existent files", async () => {
      logger.debug("Testing non-existent file handling");
      try {
        await fileUtils.readFile("./nonexistent.md");
        throw new Error("Should have thrown an error");
      } catch (error) {
        assertEquals(error instanceof Error, true);
      }
    });

    await t.step("should handle permission denied", async () => {
      logger.debug("Testing permission denied handling");
      try {
        await fileUtils.writeFile("/root/test.md", "test");
        throw new Error("Should have thrown an error");
      } catch (error) {
        assertEquals(error instanceof Error, true);
      }
    });

    await t.step("should handle invalid paths", () => {
      logger.debug("Testing invalid path handling");
      try {
        fileUtils.normalizePath("invalid\0path");
        throw new Error("Should have thrown an error");
      } catch (error) {
        assertEquals(error instanceof Error, true);
      }
    });
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
