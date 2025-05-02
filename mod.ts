/**
 * BreakdownPrompt
 * 
 * A library for managing and generating prompts from templates with variable replacement.
 * This library provides functionality to:
 * - Load prompt templates from files
 * - Replace variables in templates with provided values
 * - Validate input parameters and file paths
 * - Handle errors gracefully with specific error types
 * - Support various variable types including file paths and markdown content
 * 
 * The library follows a strict validation process for:
 * - File paths (existence and permissions)
 * - Variable names (naming conventions and uniqueness)
 * - Markdown content format
 * - Security considerations for file operations
 * 
 * For detailed usage instructions, see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/user_guide.md | User Guide}
 * For API reference, see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/api_reference.md | API Reference}
 * For design patterns, see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/design_pattern.ja.md | Design Pattern}
 * 
 * @module
 */

/**
 * Main class for managing prompts and template processing.
 * @see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/api_reference.md#promptmanager | PromptManager API Reference}
 */
export { PromptManager } from "./src/core/prompt_manager.ts";

/**
 * Type definition for prompt parameters.
 * @see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/api_reference.md#interfaces | Interfaces}
 */
export type { PromptParams } from "./src/types/prompt_params.ts";

/**
 * Type definition for prompt generation results.
 * @see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/api_reference.md#interfaces | Interfaces}
 */
export type { PromptGenerationResult, PromptSuccessResult as PromptResult } from "./src/types/prompt_result.ts";

/**
 * Custom error types for validation and file system operations.
 * @see {@link https://github.com/tettuan/breakdownprompt/blob/main/docs/api_reference.md#error-handling | Error Handling}
 */
export { ValidationError, FileSystemError } from "./src/errors.ts"; 