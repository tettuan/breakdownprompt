/**
 * Result of prompt generation operation.
 *
 * @interface PromptResult
 * @description
 * This interface represents the result of a prompt generation operation.
 * It includes the template path, generated content (if successful), and variable statistics.
 *
 * @property {boolean} success - Indicates whether the operation was successful.
 * @property {string} [error] - Error message if the operation failed.
 * @property {string} templatePath - Path to the template file.
 * @property {string} [content] - The generated prompt content with variables replaced (only if successful).
 * @property {Object} variables - Statistics about variable detection and replacement.
 * @property {string[]} variables.detected - List of variables detected in the template.
 * @property {string[]} variables.replaced - List of variables that were successfully replaced.
 * @property {string[]} variables.remaining - List of variables that were not replaced.
 *
 * @example
 * ```typescript
 * // Success case
 * const result: PromptResult = {
 *   success: true,
 *   templatePath: "templates/hello.md",
 *   content: "Hello, John!",
 *   variables: {
 *     detected: ["name"],
 *     replaced: ["name"],
 *     remaining: []
 *   }
 * };
 *
 * // Error case
 * const errorResult: PromptResult = {
 *   success: false,
 *   templatePath: "templates/hello.md",
 *   error: "Template not found",
 *   variables: {
 *     detected: [],
 *     replaced: [],
 *     remaining: []
 *   }
 * };
 * ```
 */
export interface PromptResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Error message if the operation failed */
  error?: string;
  /** Path to the template file */
  templatePath: string;
  /** The generated prompt content (only if successful) */
  content?: string;
  /** Statistics about variable detection and replacement */
  variables: {
    /** List of variables detected in the template */
    detected: string[];
    /** List of variables that were successfully replaced */
    replaced: string[];
    /** List of variables that were not replaced */
    remaining: string[];
  };
}

/**
 * @deprecated Use PromptResult instead
 */
export interface PromptSuccessResult {
  /** Operation succeeded */
  success: true;
  /** The generated prompt content */
  prompt: string;
  /** List of variables found in the template */
  variables: string[];
  /** List of unknown variables found in the template */
  unknownVariables?: string[];
}

/**
 * @deprecated Use PromptResult instead
 */
export interface PromptErrorResult {
  /** Operation failed */
  success: false;
  /** Error message explaining the failure */
  error: string;
  /** List of unknown variables found in the template */
  unknownVariables?: string[];
}

/**
 * @deprecated Use PromptResult instead
 */
export type PromptGenerationResult = PromptSuccessResult | PromptErrorResult;
