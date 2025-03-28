/**
 * Test Utilities
 *
 * This file provides common utilities for testing the prompt management framework.
 * It includes logging setup and common test configurations.
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";

// Configure logging based on environment
const logger = new BreakdownLogger();

// Test configuration constants
export const TEST_CONFIG = {
  BASE_DIR: "./test_fixtures",
  OUTPUT_DIR: "./test_output",
} as const;

// Common test parameters
export const TEST_PARAMS = {
  PROMPT_FILE_PATH: "./test_fixtures/templates/example.md",
  DESTINATION: TEST_CONFIG.OUTPUT_DIR,
  MULTIPLE_FILES: false,
  STRUCTURED: false,
} as const;

// Helper function to create test directories
export async function setupTestDirs(): Promise<void> {
  logger.debug("Setting up test directories", { config: TEST_CONFIG });
  try {
    await Deno.mkdir(TEST_CONFIG.BASE_DIR, { recursive: true });
    await Deno.mkdir(TEST_CONFIG.OUTPUT_DIR, { recursive: true });
    logger.debug("Test directories created successfully");
  } catch (error) {
    logger.error("Failed to create test directories", { error });
    throw error;
  }
}

// Helper function to cleanup test directories
export async function cleanupTestDirs(): Promise<void> {
  logger.debug("Cleaning up test directories", { config: TEST_CONFIG });
  try {
    await Deno.remove(TEST_CONFIG.BASE_DIR, { recursive: true });
    await Deno.remove(TEST_CONFIG.OUTPUT_DIR, { recursive: true });
    logger.debug("Test directories cleaned up successfully");
  } catch (error) {
    logger.error("Failed to clean up test directories", { error });
    throw error;
  }
}

// Helper function to copy fixture files
export async function copyFixtureFiles(): Promise<void> {
  logger.debug("Copying fixture files", { baseDir: TEST_CONFIG.BASE_DIR });
  try {
    // Create templates directory
    await Deno.mkdir(`${TEST_CONFIG.BASE_DIR}/templates`, { recursive: true });
    logger.debug("Templates directory created");

    // Create example template
    const templateContent = `# Example Template

## Input
{input_markdown}

## Schema
{schema_file}

## Output Location
{destination_path}`;

    await Deno.writeTextFile(TEST_PARAMS.PROMPT_FILE_PATH, templateContent);
    logger.debug("Fixture files copied successfully");
  } catch (error) {
    logger.error("Failed to copy fixture files", { error });
    throw error;
  }
}
