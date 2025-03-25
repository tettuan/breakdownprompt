/**
 * Parameters for prompt generation.
 * @interface PromptParams
 */
export interface PromptParams {
  /** Type of demonstration (e.g., 'task', 'example') */
  demonstrativeType: string;
  /** Target layer type (e.g., 'implementation', 'design') */
  layerType: string;
  /** Source layer type */
  fromLayerType: string;
  /** Output destination path */
  destination: string;
  /** Whether to split output into multiple files */
  multipleFiles: boolean;
  /** Whether to format output as structured data */
  structured: boolean;
  /** Custom validation function */
  validate(): boolean;
}

/**
 * Interface for variable replacement operations.
 * @interface VariableReplacer
 */
export interface VariableReplacer {
  /** Replace a variable with its value */
  replace(value: unknown): string;
  /** Validate a variable value */
  validate(value: unknown): boolean;
}

/**
 * Result of output operations.
 * @interface OutputResult
 */
export interface OutputResult {
  /** Whether the operation was successful */
  success: boolean;
  /** List of generated file paths */
  files: string[];
  /** Error message if operation failed */
  error?: string;
}

/**
 * Result of prompt generation.
 * @interface PromptResult
 */
export interface PromptResult {
  /** Generated prompt content */
  content: string;
  /** Metadata about the generation process */
  metadata: {
    /** Original template string */
    template: string;
    /** Map of variable names to their values */
    variables: Map<string, string>;
    /** Timestamp of generation */
    timestamp: Date;
  };
}
