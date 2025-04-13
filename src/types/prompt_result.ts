/**
 * Result of prompt generation operation.
 * @interface PromptResult
 */
export interface PromptResult {
  /** Whether the prompt generation was successful */
  success: boolean;
  /** The generated prompt content, if successful */
  prompt?: string;
  /** Error message if the operation failed */
  error?: string;
  /** Alternative content field for the generated prompt */
  content?: string;
  /** List of variables found in the template */
  variables?: string[];
  /** List of unknown variables found in the template */
  unknownVariables?: string[];
}
