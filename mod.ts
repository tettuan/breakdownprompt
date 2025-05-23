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
export { PromptManager } from "./src/core/prompt_manager.ts";
export type { PromptResult } from "./src/types/prompt_result.ts";
export type { PromptParams } from "./src/types/prompt_params.ts";
export type { Variables } from "./src/types/variables.ts";

// Error types
export { FileSystemError, TemplateError, ValidationError } from "./src/errors.ts";

// Version and metadata
export { VERSION, META } from "./src/version.ts";
