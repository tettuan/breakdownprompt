/**
 * Result of successful prompt generation operation.
 * @interface PromptSuccessResult
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
