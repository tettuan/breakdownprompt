/**
 * A Deno module for managing and generating prompts from templates with variable replacement.
 * @module
 */

// Re-export all public APIs
export * from "./types.ts";
export { PromptManager } from "./prompt_manager.ts";
export {
  breakdownByDelimiter,
  breakdownByHeaders,
  breakdownByLineCount,
} from "./utils/breakdown.ts";
export { formatAsMarkdown, formatAsStructured, formatFilename } from "./utils/format.ts";
export {
  validateBoolean,
  validateFunction,
  validateNumber,
  validateString,
  ValidationError,
} from "./utils/validate.ts";

// Version information
export const VERSION = "0.1.2";

// Module metadata
export const META = {
  name: "@tettuan/breakdownprompt",
  description:
    "A Deno module for managing and generating prompts from templates with variable replacement",
  homepage: "https://github.com/tettuan/breakdownprompt",
  license: "MIT",
  author: "tettuan",
} as const;
