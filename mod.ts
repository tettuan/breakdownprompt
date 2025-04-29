/**
 * BreakdownPrompt
 * 
 * A library for managing and generating prompts from templates with variable replacement.
 * 
 * @module
 */

export { PromptManager } from "./src/core/prompt_manager.ts";
export type { PromptParams } from "./src/types/prompt_params.ts";
export type { PromptResult } from "./src/types/prompt_result.ts";
export { ValidationError, FileSystemError } from "./src/errors.ts"; 