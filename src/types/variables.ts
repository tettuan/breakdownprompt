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
 * Interface for validating variables
 */
export interface VariableValidator {
  validateKey(key: string): key is ValidVariableKey;
  validateFilePath(path: string): Promise<boolean>;
  validateDirectoryPath(path: string): Promise<boolean>;
  validateMarkdownText(text: string): text is MarkdownText;
  validateVariables(variables: Variables): Promise<boolean>;
}
