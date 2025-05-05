// BreakdownPrompt
// 
// Note: Using regular comments instead of JSDoc to ensure README.md is displayed in JSR's Overview tab.
// JSDoc module documentation would take precedence over README.md in the Overview tab.
// 
// A library for managing and generating prompts from templates with variable replacement.
// This library provides functionality to:
// - Load prompt templates from files
// - Replace variables in templates with provided values
// - Validate input parameters and file paths
// - Handle errors gracefully with specific error types
// - Support various variable types including file paths and markdown content
// 
// The library follows a strict validation process for:
// - File paths (existence and permissions)
// - Variable names (naming conventions and uniqueness)
// - Markdown content format
// - Security considerations for file operations
// 
// For detailed usage instructions, see the README.md file in the repository.
// The README contains comprehensive documentation including:
// - Installation instructions
// - Usage examples
// - API reference
// - Design patterns
// - Contributing guidelines

// Core functionality
export { PromptManager } from "./core/prompt_manager.ts";
export type { PromptResult } from "./types/prompt_result.ts";
export type { PromptParams } from "./types/prompt_params.ts";
export type { Variables } from "./types/variables.ts";

// Error types
export { FileSystemError, TemplateError, ValidationError } from "./errors.ts";

/**
 * The current version of the package.
 * This is defined as a constant to ensure consistent version information
 * across different execution contexts, including tests and subprocesses.
 * @constant
 */
export const VERSION = "1.2.1";

/**
 * Metadata about the package.
 * @constant
 * @property {string} name - The package name
 * @property {string} description - A brief description of the package
 * @property {string} homepage - The package's homepage URL
 * @property {string} license - The package's license
 * @property {string} author - The package's author
 */
export const META = {
  name: "@tettuan/breakdownprompt",
  description:
    "A Deno module for managing and generating prompts from templates with variable replacement",
  homepage: "https://github.com/tettuan/breakdownprompt",
  license: "MIT",
  author: "tettuan",
} as const;
