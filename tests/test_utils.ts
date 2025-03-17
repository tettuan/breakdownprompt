/**
 * Test Utilities
 * 
 * This file provides common utilities for testing the prompt management framework.
 * It includes logging setup and common test configurations.
 */

import { getLogger } from "std/log/mod.ts";

// Configure logging based on environment
const logLevel = Deno.env.get("LOG_LEVEL") || "info";
const logger = getLogger("test");

// Test configuration constants
export const TEST_CONFIG = {
  CACHE_SIZE: 10,
  TIMEOUT: 1000,
  BASE_DIR: "./test_templates",
  OUTPUT_DIR: "./test_output",
} as const;

// Common test parameters
export const TEST_PARAMS = {
  DEMONSTRATIVE_TYPE: "test",
  LAYER_TYPE: "test_layer",
  FROM_LAYER_TYPE: "test_from",
  DESTINATION: TEST_CONFIG.OUTPUT_DIR,
  MULTIPLE_FILES: false,
  STRUCTURED: false,
} as const;

// Helper function to create test directories
export async function setupTestDirs(): Promise<void> {
  try {
    await Deno.mkdir(TEST_CONFIG.BASE_DIR, { recursive: true });
    await Deno.mkdir(TEST_CONFIG.OUTPUT_DIR, { recursive: true });
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