/**
 * Parameters for prompt generation.
 * @interface PromptParams
 */
export interface PromptParams {
  /** Path to the prompt template file */
  prompt_file_path: string;
  /** Variables to replace in the template */
  variables: Record<string, unknown>;
}

/**
 * Result of prompt generation.
 * @interface PromptResult
 */
export interface PromptResult {
  /** Generated prompt content */
  content: string;
  /** List of variables found in the template */
  variables: string[];
  /** List of unknown variables found in the template */
  unknownVariables?: string[];
}

/**
 * Interface for variable replacement.
 * @interface VariableReplacer
 */
export interface VariableReplacer {
  /** Validate the replacement value */
  validate(value: unknown): boolean;
  /** Replace the variable with its value */
  replace(value: unknown): string;
}

/**
 * Valid variable key type.
 * Ensures keys follow naming rules:
 * - English alphanumeric and underscore only
 * - Must start with a letter
 * - Case sensitive
 */
export type ValidVariableKey = string & {
  readonly _brand: unique symbol;
};

/**
 * File path type.
 * Ensures value is a valid file path.
 */
export type FilePath = string & {
  readonly _type: "file_path";
  readonly _brand: unique symbol;
};

/**
 * Directory path type.
 * Ensures value is a valid directory path.
 */
export type DirectoryPath = string & {
  readonly _type: "directory_path";
  readonly _brand: unique symbol;
};

/**
 * Markdown text type.
 * Ensures value is valid markdown format.
 */
export type MarkdownText = string & {
  readonly _type: "markdown_text";
  readonly _brand: unique symbol;
};

/**
 * Variables type.
 * All keys are optional (Partial type).
 * Keys must conform to ValidVariableKey.
 * Values must be FilePath, DirectoryPath, or MarkdownText.
 */
export type Variables = Partial<
  {
    [K in ValidVariableKey]: FilePath | DirectoryPath | MarkdownText;
  }
>;

export interface VariableValidator {
  validateFilePath(path: string): Promise<boolean>;
  validateDirectoryPath(path: string): Promise<boolean>;
  validateMarkdownText(text: string): text is MarkdownText;
  validateKey(key: string): boolean;
  validateVariables(variables: Record<string, unknown>): Promise<boolean>;
}
