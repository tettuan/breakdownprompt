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
 * TextContent represents valid text content
 */
export type TextContent = string & {
  readonly _type: "text_content";
};

/**
 * Represents a set of variables with their values.
 * 
 * @type {Variables}
 * @description
 * This type defines a record of variables where:
 * - Keys are valid variable names (ValidVariableKey)
 * - Values can be file paths, directory paths, or text content
 * 
 * @example
 * ```typescript
 * const variables: Variables = {
 *   input_file: "./src/main.ts" as FilePath,
 *   output_dir: "./dist" as DirectoryPath,
 *   description: "Code review task" as TextContent
 * };
 * ```
 */
export type Variables = Partial<
  {
    [K in ValidVariableKey]: FilePath | DirectoryPath | TextContent;
  }
>;

/**
 * Interface for validating variables and their values.
 * 
 * @interface VariableValidator
 * @description
 * This interface defines methods for validating different types of variables:
 * - Variable keys (names)
 * - File paths
 * - Directory paths
 * - Sets of variables
 * 
 * @example
 * ```typescript
 * const validator = new VariableValidator();
 * const isValid = await validator.validateVariables({
 *   input_file: "./src/main.ts",
 *   output_dir: "./dist"
 * });
 * ```
 */
export interface VariableValidator {
  /**
   * Validates a variable key.
   * @param key - The key to validate
   * @returns true if the key is valid
   */
  validateKey(key: string): key is ValidVariableKey;

  /**
   * Validates a file path.
   * @param path - The path to validate
   * @returns A promise that resolves to true if the path is valid
   */
  validateFilePath(path: string): Promise<boolean>;

  /**
   * Validates a directory path.
   * @param path - The path to validate
   * @returns A promise that resolves to true if the path is valid
   */
  validateDirectoryPath(path: string): Promise<boolean>;

  /**
   * Validates a set of variables.
   * @param variables - The variables to validate
   * @returns A promise that resolves to true if all variables are valid
   */
  validateVariables(variables: Variables): Promise<boolean>;
}
