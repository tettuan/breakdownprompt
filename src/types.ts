/**
 * Parameters for prompt generation.
 * @interface PromptParams
 */
export interface PromptParams {
  /** Path to the prompt template file */
  prompt_file_path: string;
  /** Output destination path */
  destination: string;
  /** Whether to split output into multiple files */
  multipleFiles: boolean;
  /** Whether to format output as structured data */
  structured: boolean;
}

/**
 * Result of prompt generation.
 * @interface PromptResult
 */
export interface PromptResult {
  /** Generated prompt content */
  content: string;
}

/**
 * Result of output generation.
 * @interface OutputResult
 */
export interface OutputResult {
  /** Whether the output was successful */
  success: boolean;
  /** List of generated file paths */
  files: string[];
  /** Error message if generation failed */
  error?: string;
}

/**
 * Interface for variable replacement.
 * @interface VariableReplacer
 */
export interface VariableReplacer {
  /** Replace the variable with its value */
  replace(value: unknown): string;
  /** Validate the replacement value */
  validate(value: unknown): boolean;
}
