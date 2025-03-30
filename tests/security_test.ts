import { assert, assertRejects } from "@std/assert";
import { PromptManager } from "../src/prompt_manager.ts";
import { OutputController } from "../src/output_controller.ts";
import { cleanupTestDirs, setupTestDirs, TEST_CONFIG } from "./test_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

// Test path injection prevention
Deno.test("Security - path injection prevention", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const manager = new PromptManager();
  const maliciousPaths = [
    "../../../etc/passwd",
    "C:\\Windows\\System32",
    "/var/log/*",
    "~/.ssh/id_rsa",
    "..\\..\\..\\Windows\\System32",
  ];

  for (const path of maliciousPaths) {
    const params = {
      prompt_file_path: path,
      destination: TEST_CONFIG.OUTPUT_DIR,
      multipleFiles: false,
      structured: false,
    };

    await assertRejects(
      async () => {
        logger.debug("Attempting to access malicious path", { path });
        await manager.generatePrompt(params);
      },
      Error,
      "Invalid file path",
    );
  }

  await cleanupTestDirs();
  logger.debug("Security path injection test completed");
});

// Test file access permissions
Deno.test("Security - file access permissions", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const controller = new OutputController(TEST_CONFIG.OUTPUT_DIR, false, false);
  
  // Test read-only directory
  const readOnlyDir = `${TEST_CONFIG.OUTPUT_DIR}/readonly`;
  await Deno.mkdir(readOnlyDir, { recursive: true });
  await Deno.chmod(readOnlyDir, 0o444); // Read-only permission

  const result = await controller.generateOutput("Test content");
  assert(!result.success, "Should fail when directory is read-only");
  assert(result.error?.includes("permission denied"), "Should have permission denied error");

  // Test write-only directory
  const writeOnlyDir = `${TEST_CONFIG.OUTPUT_DIR}/writeonly`;
  await Deno.mkdir(writeOnlyDir, { recursive: true });
  await Deno.chmod(writeOnlyDir, 0o222); // Write-only permission

  const writeOnlyController = new OutputController(writeOnlyDir, false, false);
  const writeResult = await writeOnlyController.generateOutput("Test content");
  assert(!writeResult.success, "Should fail when directory is write-only");
  assert(writeResult.error?.includes("permission denied"), "Should have permission denied error");

  await cleanupTestDirs();
  logger.debug("Security file access permissions test completed");
});

// Test special character handling
Deno.test("Security - special character handling", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const manager = new PromptManager();
  const specialChars = [
    "file with spaces.md",
    "file@with@at@signs.md",
    "file#with#hash.md",
    "file$with$dollar.md",
    "file%with%percent.md",
    "file&with&and.md",
    "file*with*star.md",
    "file+with+plus.md",
    "file-with-dash.md",
    "file_with_underscore.md",
  ];

  for (const filename of specialChars) {
    const params = {
      prompt_file_path: `${TEST_CONFIG.BASE_DIR}/${filename}`,
      destination: TEST_CONFIG.OUTPUT_DIR,
      multipleFiles: false,
      structured: false,
    };

    await assertRejects(
      async () => {
        logger.debug("Attempting to access file with special characters", { filename });
        await manager.generatePrompt(params);
      },
      Error,
      "Invalid file path",
    );
  }

  await cleanupTestDirs();
  logger.debug("Security special character handling test completed");
});

// Test relative path restrictions
Deno.test("Security - relative path restrictions", async () => {
  await setupTestDirs();
  logger.debug("Setting up test directories");

  const manager = new PromptManager();
  const relativePaths = [
    "./../outside",
    "../outside",
    "../../outside",
    "subdir/../../outside",
    "subdir/../outside",
  ];

  for (const path of relativePaths) {
    const params = {
      prompt_file_path: path,
      destination: TEST_CONFIG.OUTPUT_DIR,
      multipleFiles: false,
      structured: false,
    };

    await assertRejects(
      async () => {
        logger.debug("Attempting to access relative path", { path });
        await manager.generatePrompt(params);
      },
      Error,
      "Invalid file path",
    );
  }

  await cleanupTestDirs();
  logger.debug("Security relative path restrictions test completed");
}); 