/**
 * Result of successful prompt generation operation.
 *
 * @interface PromptSuccessResult
 * @description
 * This interface represents the successful result of a prompt generation operation.
 * It includes the generated prompt content, list of variables found, and any unknown variables.
 *
 * @property {true} success - Indicates that the operation was successful.
 * @property {string} prompt - The generated prompt content with variables replaced.
 * @property {string[]} variables - List of variables found and processed in the template.
 * @property {string[]} [unknownVariables] - Optional list of variables found in the template
 *   but not provided in the input variables.
 *
 * @example
 * ```typescript
 * const result: PromptSuccessResult = {
 *   success: true,
 *   prompt: "Hello, John! Welcome to our system.",
 *   variables: ["name"],
 *   unknownVariables: ["age"]
 * };
 * ```
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
 * Result of failed prompt generation operation.
 * @interface PromptErrorResult
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
 * Union type for all possible prompt generation results
 */
export type PromptGenerationResult = PromptSuccessResult | PromptErrorResult;
