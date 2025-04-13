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

const logger = new BreakdownLogger();

// Test configuration
export const TEST_CONFIG = {
  BASE_DIR: join(Deno.cwd(), "tmp", "test"),
  TEMPLATES_DIR: join(Deno.cwd(), "tmp", "test", "templates"),
  SCHEMA_DIR: join(Deno.cwd(), "tmp", "test", "schema"),
  INPUT_DIR: join(Deno.cwd(), "tmp", "test", "input"),
  OUTPUT_DIR: join(Deno.cwd(), "tmp", "test", "output"),
};

// Test parameters
export const TEST_PARAMS = {
  prompt_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "simple.md"),
  test_dir: TEST_CONFIG.TEMPLATES_DIR,
  empty_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "empty.md"),
  whitespace_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "whitespace.md"),
  no_permission_file_path: join(TEST_CONFIG.TEMPLATES_DIR, "no_permission.md"),
  variables: {
    schema_file: join(TEST_CONFIG.SCHEMA_DIR, "base.schema.json"),
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    destination_path: join(TEST_CONFIG.OUTPUT_DIR, "output.md"),
  },
};

// Setup test directories and files
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
{input_markdown}

## Input File
{input_markdown_file}

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

    // Create input markdown file
    const inputContent = "# Sample Markdown\nThis is a sample markdown content.";
    await Deno.writeTextFile(
      join(TEST_CONFIG.INPUT_DIR, "sample.md"),
      inputContent,
    );
    await Deno.chmod(join(TEST_CONFIG.INPUT_DIR, "sample.md"), 0o644);
    logger.debug("Created input markdown file", {
      path: join(TEST_CONFIG.INPUT_DIR, "sample.md"),
    });

    // Create output file
    await Deno.writeTextFile(
      join(TEST_CONFIG.OUTPUT_DIR, "output.md"),
      "# Output\nThis is a placeholder output file.",
    );
    await Deno.chmod(join(TEST_CONFIG.OUTPUT_DIR, "output.md"), 0o644);
    logger.debug("Created output file", {
      path: join(TEST_CONFIG.OUTPUT_DIR, "output.md"),
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
