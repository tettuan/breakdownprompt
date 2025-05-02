/**
 * Absolute Path Validator Test
 *
 * Purpose:
 * - Verify that absolute paths can be validated correctly
 * - Test temporary directory path validation
 * - Ensure system-specific paths are handled properly
 */

import { assertEquals } from "jsr:@std/testing@^0.220.1/asserts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PathValidator } from "../../../src/validation/path_validator.ts";

const logger = new BreakdownLogger();

// Pre-processing and Preparing Part
let pathValidator: PathValidator;
const tempDir = await Deno.makeTempDir({
  prefix: "breakdown_test_",
});

function setupTest() {
  pathValidator = new PathValidator();
  // Add the test temp directory as an allowed prefix
  pathValidator.addAllowedPrefix(tempDir);
}

async function cleanupTest() {
  try {
    await Deno.remove(tempDir, { recursive: true });
  } catch (_error) {
    // Ignore cleanup errors
  }
}

// Main Test
Deno.test({
  name: "Absolute Path Validation Tests",
  async fn(t) {
    setupTest();

    await t.step("should validate absolute path in temporary directory", async () => {
      logger.debug("Testing absolute path in temporary directory");
      const absolutePath = `${tempDir}/test_file.md`;
      await Deno.writeTextFile(absolutePath, "test content");

      const validatedPath = await pathValidator.validateFilePath(absolutePath);
      assertEquals(typeof validatedPath, "string");
      assertEquals(validatedPath.startsWith(tempDir), true);

      await Deno.remove(absolutePath);
    });

    await t.step("should validate absolute path with special characters", async () => {
      logger.debug("Testing absolute path with special characters");
      const specialPath = `${tempDir}/test-file_1.md`;
      await Deno.writeTextFile(specialPath, "test content");

      const validatedPath = await pathValidator.validateFilePath(specialPath);
      assertEquals(typeof validatedPath, "string");
      assertEquals(validatedPath.startsWith(tempDir), true);

      await Deno.remove(specialPath);
    });

    await t.step("should validate system temporary directory path", async () => {
      logger.debug("Testing system temporary directory path");
      const systemTempDir = await Deno.makeTempDir({
        prefix: "breakdown_system_",
      });
      pathValidator.addAllowedPrefix(systemTempDir);

      const validatedPath = await pathValidator.validateDirectoryPath(systemTempDir);
      assertEquals(typeof validatedPath, "string");
      assertEquals(validatedPath.startsWith(systemTempDir), true);

      await Deno.remove(systemTempDir);
    });

    await t.step("should validate nested temporary directory path", async () => {
      logger.debug("Testing nested temporary directory path");
      const nestedDir = `${tempDir}/nested/path/test`;
      await Deno.mkdir(nestedDir, { recursive: true });

      const validatedPath = await pathValidator.validateDirectoryPath(nestedDir);
      assertEquals(typeof validatedPath, "string");
      assertEquals(validatedPath.startsWith(tempDir), true);
    });

    await cleanupTest();
  },
  sanitizeResources: false,
  sanitizeOps: false,
}); 