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
 * Represents a file path with specific extensions
 */
export type FilePath = string & {
  readonly _type: "file_path";
};

/**
 * Represents a directory path
 */
export type DirectoryPath = string & {
  readonly _type: "directory_path";
};

/**
 * Represents text content
 */
export type TextContent = string & {
  readonly _type: "text_content";
};

/**
 * Valid variable key type that follows naming rules
 */
export type ValidVariableKey = string & {
  readonly _brand: unique symbol;
};

/**
 * Variables type that maps valid keys to specific value types
 */
export type Variables = Partial<
  {
    [K in ValidVariableKey]: FilePath | DirectoryPath | TextContent;
  }
>;

/**
 * Interface for validating variables.
 * Provides methods for validating different types of variables.
 */
export interface VariableValidator {
  /**
   * Validates a file path.
   * @param path - The path to validate
   * @returns Promise that resolves to true if the path is valid
   */
  validateFilePath(path: string): Promise<boolean>;

  /**
   * Validates a directory path.
   * @param path - The path to validate
   * @returns Promise that resolves to true if the path is valid
   */
  validateDirectoryPath(path: string): Promise<boolean>;

  /**
   * Validates text content.
   * @param text - The text to validate
   * @returns true if the text is valid
   */
  validateTextContent(text: string): text is TextContent;

  /**
   * Validates a variable key.
   * @param key - The key to validate
   * @returns true if the key is valid
   */
  validateKey(key: string): boolean;

  /**
   * Validates a set of variables.
   * @param variables - The variables to validate
   * @returns Promise that resolves to true if all variables are valid
   */
  validateVariables(variables: Record<string, unknown>): Promise<boolean>;
}
