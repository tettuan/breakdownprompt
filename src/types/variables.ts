/**
 * Type definitions for prompt variables
 * @module types/variables
 */

/**
 * ValidVariableKey represents a variable key that follows the naming rules:
 * - Only alphanumeric characters and underscores are allowed
 * - Must start with a letter
 * - Case sensitive
 */
export type ValidVariableKey = string & {
  readonly _brand: unique symbol;
};

/**
 * FilePath represents a valid file path
 */
export type FilePath = string & {
  readonly _type: "file_path";
};

/**
 * DirectoryPath represents a valid directory path
 */
export type DirectoryPath = string & {
  readonly _type: "directory_path";
};

/**
 * MarkdownText represents valid markdown content
 */
export type MarkdownText = string & {
  readonly _type: "markdown_text";
};

/**
 * Variables represents a set of variables with their values
 */
export type Variables = Partial<
  {
    [K in ValidVariableKey]: FilePath | DirectoryPath | MarkdownText;
  }
>;

/**
 * Interface for validating variables and their values.
 * @interface VariableValidator
 */
export interface VariableValidator {
  /**
   * Validates a variable key.
   * @param key The key to validate
   * @returns true if the key is valid
   */
  validateKey(key: string): key is ValidVariableKey;

  /**
   * Validates a file path.
   * @param path The path to validate
   * @returns A promise that resolves to true if the path is valid
   */
  validateFilePath(path: string): Promise<boolean>;

  /**
   * Validates a directory path.
   * @param path The path to validate
   * @returns A promise that resolves to true if the path is valid
   */
  validateDirectoryPath(path: string): Promise<boolean>;

  /**
   * Validates markdown text.
   * @param text The text to validate
   * @returns true if the text is valid markdown
   */
  validateMarkdownText(text: string): text is MarkdownText;

  /**
   * Validates a set of variables.
   * @param variables The variables to validate
   * @returns A promise that resolves to true if all variables are valid
   */
  validateVariables(variables: Variables): Promise<boolean>;
}
