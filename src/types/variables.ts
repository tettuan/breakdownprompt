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
 * MarkdownText represents valid markdown text
 */
export type MarkdownText = string & {
  readonly _type: "markdown_text";
};

/**
 * Variables represents the collection of all possible variables
 * All keys are optional (Partial)
 */
export type Variables = Partial<{
  [K in ValidVariableKey]: FilePath | DirectoryPath | MarkdownText;
}>;

/**
 * Interface for validating variables
 */
export interface VariableValidator {
  validateKey(key: string): key is ValidVariableKey;
  validateFilePath(path: string): path is FilePath;
  validateDirectoryPath(path: string): path is DirectoryPath;
  validateMarkdownText(text: string): text is MarkdownText;
} 