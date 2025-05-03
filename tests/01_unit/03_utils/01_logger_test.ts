/**
 * Test Utilities
 *
 * Purpose:
 * - Provide common test setup and cleanup functions
 * - Define test configuration and parameters
 * - Handle test directory management
 *
 * Background:
 * These utilities ensure consistent test environment setup and cleanup
 * across all test files, following the patterns in docs/design_pattern.ja.md.
 */

import { join } from "https://deno.land/std/path/mod.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { assertEquals, type assertThrows as _assertThrows } from "@std/assert";
import type { ValidationError as _ValidationError } from "../../../src/errors.ts";

const logger = new BreakdownLogger();

// Setup: Test configuration and parameters
/**
 * Configuration for test directories and paths.
 * @constant
 * @property {string} BASE_DIR - Base directory for all test files
 * @property {string} TEMPLATES_DIR - Directory for template files
 * @property {string} SCHEMA_DIR - Directory for schema files
 * @property {string} INPUT_DIR - Directory for input files
 * @property {string} OUTPUT_DIR - Directory for output files
 */
export const TEST_CONFIG = {
  BASE_DIR: join(Deno.cwd(), "tmp", "test"),
  TEMPLATES_DIR: join(Deno.cwd(), "tmp", "test", "templates"),
  SCHEMA_DIR: join(Deno.cwd(), "tmp", "test", "schema"),
  INPUT_DIR: join(Deno.cwd(), "tmp", "test", "input"),
  OUTPUT_DIR: join(Deno.cwd(), "tmp", "test", "output"),
};

// Setup: Test parameters and sample data
/**
 * Test parameters and sample data for testing.
 * @constant
 * @property {string} prompt_file_path - Path to a sample prompt template
 * @property {string} test_dir - Directory containing test files
 * @property {string} empty_file_path - Path to an empty file
 * @property {string} whitespace_file_path - Path to a file containing only whitespace
 * @property {string} no_permission_file_path - Path to a file with restricted permissions
 * @property {Object} variables - Sample variables for testing
 * @property {string} variables.schema_file - Path to a sample schema file
 * @property {string} variables.input_text - Sample text content
 * @property {string} variables.input_text_file - Path to a sample text file
 * @property {string} variables.destination_path - Path for output files
 */
export const TEST_PARAMS = {
  prompt_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
  test_dir: TEST_CONFIG.TEMPLATES_DIR,
  empty_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "empty.md"),
  whitespace_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "whitespace.md"),
  no_permission_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "no_permission.md"),
  variables: {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_text: "# Sample Text\nThis is a sample text content.",
    input_text_file: join(TEST_CONFIG.INPUT_DIR, "sample.txt"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output.txt"),
  },
};

// Setup: Mock console.log to capture output
let capturedOutput: string[] = [];
const originalConsoleLog = console.log;

function mockConsoleLog(...args: unknown[]): void {
  const formattedArgs = args.map((arg) => {
    if (typeof arg === "object" && arg !== null) {
      if (arg instanceof Error) {
        return arg.message;
      }
      const obj = arg as Record<string, unknown>;
      if (obj.error instanceof Error) {
        return `Error occurred: ${obj.error.message}`;
      }
      return JSON.stringify(arg);
    }
    return String(arg);
  });
  capturedOutput.push(formattedArgs.join(" "));
}

// Setup: Logger test environment
function setupLoggerTest(): void {
  capturedOutput = [];
  console.log = mockConsoleLog;
  // Set environment variable for log level
  Deno.env.set("LOG_LEVEL", "debug");
}

function teardownLoggerTest(): void {
  console.log = originalConsoleLog;
  // Clean up environment variable
  Deno.env.delete("LOG_LEVEL");
}

// Main: Test directory setup and cleanup
export async function setupTestDirs(): Promise<void> {
  logger.info("Setting up test directories");

  // First ensure tmp directory exists with proper permissions
  const tmpDir = join(Deno.cwd(), "tmp");
  try {
    await Deno.mkdir(tmpDir, { recursive: true });
    await Deno.chmod(tmpDir, 0o777);
    logger.debug("Created tmp directory", { path: tmpDir });
  } catch (error) {
    logger.error("Failed to create tmp directory", { error });
    throw error;
  }

  // Create base directory with full permissions
  try {
    await Deno.mkdir(TEST_CONFIG.BASE_DIR, { recursive: true });
    await Deno.chmod(TEST_CONFIG.BASE_DIR, 0o777);
    logger.debug("Created base directory", { path: TEST_CONFIG.BASE_DIR });
  } catch (error) {
    logger.error("Failed to create base directory", { error });
    throw error;
  }

  // Create subdirectories with full permissions
  for (
    const dir of [
      TEST_CONFIG.TEMPLATES_DIR,
      TEST_CONFIG.SCHEMA_DIR,
      TEST_CONFIG.INPUT_DIR,
      TEST_CONFIG.OUTPUT_DIR,
    ]
  ) {
    try {
      // Clean up existing directory if it exists
      try {
        await Deno.remove(dir, { recursive: true });
      } catch (_error) {
        // Ignore error if directory doesn't exist
      }
      await Deno.mkdir(dir, { recursive: true });
      await Deno.chmod(dir, 0o777);
      logger.debug("Created directory", { path: dir });
    } catch (error) {
      logger.error("Failed to create directory", { path: dir, error });
      throw error;
    }
  }

  // Create test files
  try {
    // Create template file
    const templateContent = `
# Sample Template

## Schema
{schema_file}

## Input
{input_text}

## Input File
{input_text_file}

## Output
{destination_path}
`;
    await Deno.writeTextFile(TEST_PARAMS.prompt_file_path, templateContent);
    await Deno.chmod(TEST_PARAMS.prompt_file_path, 0o644);
    logger.debug("Created template file", { path: TEST_PARAMS.prompt_file_path });

    // Create empty file
    await Deno.writeTextFile(TEST_PARAMS.empty_file_path, "");
    await Deno.chmod(TEST_PARAMS.empty_file_path, 0o644);
    logger.debug("Created empty file", { path: TEST_PARAMS.empty_file_path });

    // Create whitespace file
    await Deno.writeTextFile(TEST_PARAMS.whitespace_file_path, "   \n  \t  \n  ");
    await Deno.chmod(TEST_PARAMS.whitespace_file_path, 0o644);
    logger.debug("Created whitespace file", { path: TEST_PARAMS.whitespace_file_path });

    // Create schema file
    const schemaContent = `{
      "$schema": "http://json-schema.org/draft-07/schema#",
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "age": {
          "type": "integer"
        }
      }
    }`;
    await Deno.writeTextFile(
      join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
      schemaContent,
    );
    await Deno.chmod(join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"), 0o644);
    logger.debug("Created schema file", {
      path: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    });

    // Create input text file
    const inputContent = "# Sample Text\nThis is a sample text content.";
    await Deno.writeTextFile(
      join(TEST_CONFIG.INPUT_DIR, "sample.txt"),
      inputContent,
    );
    await Deno.chmod(join(TEST_CONFIG.INPUT_DIR, "sample.txt"), 0o644);
    logger.debug("Created input text file", {
      path: join(TEST_CONFIG.INPUT_DIR, "sample.txt"),
    });

    // Create output file
    await Deno.writeTextFile(
      join(TEST_CONFIG.OUTPUT_DIR, "output.txt"),
      "# Output\nThis is a placeholder output file.",
    );
    await Deno.chmod(join(TEST_CONFIG.OUTPUT_DIR, "output.txt"), 0o644);
    logger.debug("Created output file", {
      path: join(TEST_CONFIG.OUTPUT_DIR, "output.txt"),
    });

    // Create no permission file - only if it doesn't exist
    try {
      await Deno.stat(TEST_PARAMS.no_permission_file_path);
      logger.debug("No permission file already exists", {
        path: TEST_PARAMS.no_permission_file_path,
      });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        try {
          await Deno.writeTextFile(TEST_PARAMS.no_permission_file_path, "Test content");
          await Deno.chmod(TEST_PARAMS.no_permission_file_path, 0o000);
          logger.debug("Created no permission file", { path: TEST_PARAMS.no_permission_file_path });
        } catch (writeError) {
          logger.warn("Could not create no permission file, continuing", { error: writeError });
        }
      }
    }
  } catch (error) {
    logger.error("Failed to create test files", { error });
    throw error;
  }

  logger.info("Test directories setup completed");
}

// Clean up test directories
export async function cleanupTestDirs(): Promise<void> {
  logger.info("Cleaning up test directories");

  try {
    await Deno.remove(TEST_CONFIG.BASE_DIR, { recursive: true });
    logger.debug("Removed base directory", { path: TEST_CONFIG.BASE_DIR });
  } catch (error) {
    logger.error("Failed to remove base directory", { error });
    throw error;
  }

  logger.info("Test directories cleanup completed");
}

// Test: Logger functionality
Deno.test("Logger should handle different log levels", () => {
  setupLoggerTest();
  try {
    const testLogger = new BreakdownLogger();
    testLogger.info("Info message");
    testLogger.debug("Debug message");
    testLogger.warn("Warning message");
    testLogger.error("Error message");

    assertEquals(capturedOutput.length, 4);
    assertEquals(capturedOutput[0].includes("[INFO]"), true);
    assertEquals(capturedOutput[1].includes("[DEBUG]"), true);
    assertEquals(capturedOutput[2].includes("[WARN]"), true);
    assertEquals(capturedOutput[3].includes("[ERROR]"), true);
  } finally {
    teardownLoggerTest();
  }
});

Deno.test("Logger should handle objects in messages", () => {
  setupLoggerTest();
  try {
    const testLogger = new BreakdownLogger();
    const testObject = { key: "value" };
    testLogger.info("Info with object", testObject);

    assertEquals(capturedOutput.length, 1);
    assertEquals(capturedOutput[0].includes("value"), true);
  } finally {
    teardownLoggerTest();
  }
});

Deno.test("Logger should handle errors", () => {
  setupLoggerTest();
  try {
    const testLogger = new BreakdownLogger();
    const error = new Error("Test error");
    testLogger.error("Error occurred", { error });

    assertEquals(capturedOutput.length, 1);
    const output = capturedOutput[0];
    assertEquals(output.includes("[ERROR]"), true);
    assertEquals(output.includes("Error occurred"), true);
  } finally {
    teardownLoggerTest();
  }
});
