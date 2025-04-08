/**
 * A Deno module for managing and generating prompts from templates with variable replacement.
 * @module
 */

// Re-export public APIs
export { PromptManager } from "./core/prompt_manager.ts";
export type { PromptParams } from "./types/prompt_params.ts";
export type { PromptResult } from "./types/prompt_result.ts";
export { FileSystemError, ValidationError } from "./errors.ts";

// Version information
export const VERSION: string = JSON.parse(Deno.readTextFileSync("./deno.json")).version;

// Module metadata
export const META = {
  name: "@tettuan/breakdownprompt",
  description:
    "A Deno module for managing and generating prompts from templates with variable replacement",
  homepage: "https://github.com/tettuan/breakdownprompt",
  license: "MIT",
  author: "tettuan",
} as const;
