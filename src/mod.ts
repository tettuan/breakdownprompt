/**
 * A Deno module for managing and generating prompts from templates with variable replacement.
 * @module
 */

// Re-export public APIs
export { PromptManager } from "./core/prompt_manager.ts";
export type { PromptParams } from "./types/prompt_params.ts";
export type {
  PromptGenerationResult,
  PromptSuccessResult as PromptResult,
} from "./types/prompt_result.ts";
export { FileSystemError, ValidationError } from "./errors.ts";

/**
 * The current version of the package.
 * This is defined as a constant to ensure consistent version information
 * across different execution contexts, including tests and subprocesses.
 * @constant
 */
export const VERSION = "1.1.1";

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
