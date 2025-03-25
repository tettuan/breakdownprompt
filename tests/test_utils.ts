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
  BASE_DIR: "./test_templates",
  OUTPUT_DIR: "./test_output",
  FIXTURES_DIR: "./tests/fixtures",
} as const;

// Common test parameters
export const TEST_PARAMS = {
  DEMONSTRATIVE_TYPE: "test",
  LAYER_TYPE: "implementation",
  FROM_LAYER_TYPE: "design",
  DESTINATION: TEST_CONFIG.OUTPUT_DIR,
  MULTIPLE_FILES: false,
  STRUCTURED: false,
} as const;

// Helper function to create test directories
export async function setupTestDirs(): Promise<void> {
  try {
    // Create base directories
    await Deno.mkdir(TEST_CONFIG.BASE_DIR, { recursive: true });
    await Deno.mkdir(TEST_CONFIG.OUTPUT_DIR, { recursive: true });

    // Create template directories
    await Deno.mkdir(
      `${TEST_CONFIG.BASE_DIR}/${TEST_PARAMS.DEMONSTRATIVE_TYPE}/${TEST_PARAMS.LAYER_TYPE}`,
      { recursive: true },
    );

    // Create schema directory
    await Deno.mkdir(`${TEST_CONFIG.BASE_DIR}/schema`, { recursive: true });

    // Create input directory
    await Deno.mkdir(`${TEST_CONFIG.BASE_DIR}/input`, { recursive: true });

    logger.debug("Test directories created successfully");
  } catch (error) {
    logger.error("Failed to create test directories:", error);
    throw error;
  }
}

// Helper function to cleanup test directories
export async function cleanupTestDirs(): Promise<void> {
  try {
    await Deno.remove(TEST_CONFIG.BASE_DIR, { recursive: true });
    await Deno.remove(TEST_CONFIG.OUTPUT_DIR, { recursive: true });
    logger.debug("Test directories cleaned up successfully");
  } catch (error) {
    logger.error("Failed to cleanup test directories:", error);
    throw error;
  }
}

// Helper function to copy fixture files
export async function copyFixtureFiles(): Promise<void> {
  try {
    // Copy template
    await Deno.copyFile(
      `${TEST_CONFIG.FIXTURES_DIR}/templates/${TEST_PARAMS.DEMONSTRATIVE_TYPE}/${TEST_PARAMS.LAYER_TYPE}/f_${TEST_PARAMS.FROM_LAYER_TYPE}.md`,
      `${TEST_CONFIG.BASE_DIR}/${TEST_PARAMS.DEMONSTRATIVE_TYPE}/${TEST_PARAMS.LAYER_TYPE}/f_${TEST_PARAMS.FROM_LAYER_TYPE}.md`,
    );

    // Copy schema
    await Deno.copyFile(
      `${TEST_CONFIG.FIXTURES_DIR}/schema/${TEST_PARAMS.LAYER_TYPE}.json`,
      `${TEST_CONFIG.BASE_DIR}/schema/${TEST_PARAMS.LAYER_TYPE}.json`,
    );

    // Copy input
    await Deno.copyFile(
      `${TEST_CONFIG.FIXTURES_DIR}/input/${TEST_PARAMS.FROM_LAYER_TYPE}.md`,
      `${TEST_CONFIG.BASE_DIR}/input/${TEST_PARAMS.FROM_LAYER_TYPE}.md`,
    );

    logger.debug("Fixture files copied successfully");
  } catch (error) {
    logger.error("Failed to copy fixture files:", error);
    throw error;
  }
}

// Helper function to read fixture content
export async function readFixtureContent(path: string): Promise<string> {
  try {
    return await Deno.readTextFile(`${TEST_CONFIG.FIXTURES_DIR}/${path}`);
  } catch (error) {
    logger.error(`Failed to read fixture content from ${path}:`, error);
    throw error;
  }
}
