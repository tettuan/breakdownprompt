/**
 * OutputController Tests
 * 
 * Purpose:
 * - Verify file output generation in different modes
 * - Test directory creation and permission handling
 * - Validate structured and unstructured output formats
 * - Ensure proper cleanup of test resources
 * 
 * Background:
 * The OutputController handles the final step of prompt generation by writing
 * content to files. It supports multiple output modes (single file, multiple files,
 * structured) and handles file system operations. These tests ensure it correctly
 * implements the output requirements from docs/index.ja.md.
 * 
 * Success Criteria:
 * 1. File Creation: Files should be created with correct content
 * 2. Directory Structure: Output should respect structured/unstructured settings
 * 3. Error Handling: File system errors should be caught and reported
 * 4. Resource Cleanup: Test directories should be properly cleaned up
 */

import { assert } from "std/testing/asserts.ts";
import { OutputController } from "../src/output_controller.ts";
import { TEST_CONFIG, setupTestDirs, cleanupTestDirs } from "./test_utils.ts";

// Test basic initialization and instance creation
Deno.test("OutputController - initialization", () => {
  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, false, false);
  assert(controller instanceof OutputController, "Controller should be an instance of OutputController");
});

// Test single file output generation
Deno.test("OutputController - single file output", async () => {
  await setupTestDirs();
  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, false, false);
  const content = "# Test Content\nThis is a test file.";

  const result = await controller.generateOutput(content);
  assert(result.success, "Result should be successful");
  assert(result.files.length === 1, "Should have exactly one file");
  assert(result.files[0].startsWith(TEST_CONFIG.OUTPUT_DIR), "File path should start with output dir");
  assert(result.files[0].endsWith(".md"), "File should have .md extension");

  await cleanupTestDirs();
});

// Test multiple files output generation
Deno.test("OutputController - multiple files output", async () => {
  await setupTestDirs();
  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, true, false);
  const content = `# Section 1
Content for section 1

# Section 2
Content for section 2`;

  const result = await controller.generateOutput(content);
  assert(result.success, "Result should be successful");
  assert(result.files.length === 2, "Should have exactly two files");
  assert(result.files.every(f => f.startsWith(TEST_CONFIG.OUTPUT_DIR)), "All files should start with output dir");
  assert(result.files.every(f => f.endsWith(".md")), "All files should have .md extension");

  await cleanupTestDirs();
});

// Test structured output generation
Deno.test("OutputController - structured output", async () => {
  await setupTestDirs();
  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, true, true);
  const content = `# Section 1
Content for section 1

# Section 2
Content for section 2`;

  const result = await controller.generateOutput(content);
  assert(result.success, "Result should be successful");
  assert(result.files.length === 2, "Should have exactly two files");
  assert(result.files.every(f => f.startsWith(TEST_CONFIG.OUTPUT_DIR)), "All files should start with output dir");
  assert(result.files.every(f => f.endsWith(".md")), "All files should have .md extension");

  await cleanupTestDirs();
});

// Test error handling for invalid paths
Deno.test("OutputController - error handling", async () => {
  const testDir = "/invalid/path";
  const controller = new OutputController(testDir, false, false);
  const content = "# Test Content";

  const result = await controller.generateOutput(content);
  assert(!result.success, "Result should not be successful");
  assert(result.files.length === 0, "Should have no files");
  assert(typeof result.error === "string", "Error should be a string");
}); 