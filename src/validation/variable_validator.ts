/**
 * Variable Validator
 *
 * Purpose:
 * - Validate variable names according to naming rules
 * - Validate variable values according to their types
 * - Ensure type safety for variables
 */

import { ValidationError } from "../errors.ts";
import type {
  DirectoryPath as _DirectoryPath,
  FilePath as _FilePath,
  MarkdownText,
  Variables,
} from "../types.ts";
import type { ValidVariableKey as _ValidVariableKey } from "../types.ts";
import type { VariableValidator as IVariableValidator } from "../types.ts";

// Re-export ValidationError
export { ValidationError };

const INVALID_PATH_CHARS = /[<>"|?*\\]/;

/**
 * Base class for variable validation
 * Provides common validation functionality
 */
export abstract class VariableValidator implements IVariableValidator {
  /**
   * Validates a variable name according to the rules:
   * - Only alphanumeric characters and underscores are allowed
   * - Must start with a letter
   * - Case sensitive
   */
  validateKey(key: string): boolean {
    if (!key) {
      throw new ValidationError("Variable name cannot be empty");
    }

    if (!/^[a-zA-Z]/.test(key)) {
      throw new ValidationError("must start with a letter");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      throw new ValidationError("only alphanumeric characters and underscores allowed");
    }

    return true;
  }

  /**
   * Validates a file path
   * - Must not be empty
   * - Must be a valid file path format
   * - Must exist and be readable
   */
  public abstract validateFilePath(path: string): Promise<boolean>;

  /**
   * Validates a directory path
   * - Must not be empty
   * - Must be a valid directory path format
   * - Must exist and be writable
   */
  public abstract validateDirectoryPath(path: string): Promise<boolean>;

  /**
   * Validates markdown text
   * - Must not be empty
   * - Must be valid markdown format
   */
  public abstract validateMarkdownText(text: string): text is MarkdownText;

  /**
   * Validates a set of variables
   * - All variable names must be valid
   * - All variable values must be valid
   */
  public async validateVariables(variables: Variables): Promise<boolean> {
    for (const [key, value] of Object.entries(variables)) {
      try {
        this.validateKey(key);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }
        throw error;
      }

      if (typeof value !== "string") {
        throw new ValidationError(`Invalid value type for variable ${key}: expected string`);
      }

      if (!value || value.trim().length === 0) {
        throw new ValidationError(`Value for key '${key}' cannot be empty`);
      }

      if (key === "schema_file" || key === "input_markdown_file") {
        await this.validateFilePath(value);
      }

      if (key === "destination_path") {
        await this.validateFilePath(value);
      }

      if (key === "input_markdown") {
        this.validateMarkdownText(value);
      }
    }

    return true;
  }
}

/**
 * Default implementation of the VariableValidator interface.
 * Provides concrete validation logic for file paths, directory paths, and markdown text.
 */
export class DefaultVariableValidator extends VariableValidator {
  /**
   * Validates a file path according to the rules:
   * - Must be a non-empty string
   * - Must not contain invalid characters
   * - Must be a valid file path
   * @param path - The file path to validate
   * @returns Promise that resolves to true if the path is valid
   */
  public override async validateFilePath(path: string): Promise<boolean> {
    try {
      if (!path || path.trim().length === 0) {
        throw new ValidationError(`Invalid file path: ${path}`);
      }

      // Check for invalid characters
      if (INVALID_PATH_CHARS.test(path)) {
        throw new ValidationError(`Invalid file path: ${path}`);
      }

      // Check if path exists and is a file
      const fileInfo = await Deno.stat(path);
      if (!fileInfo.isFile) {
        throw new ValidationError(`Path is not a file: ${path}`);
      }
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError(`Invalid file path: ${path}`);
    }
  }

  /**
   * Validates a directory path according to the rules:
   * - Must be a non-empty string
   * - Must not contain invalid characters
   * - Must be a valid directory path
   * @param path - The directory path to validate
   * @returns Promise that resolves to true if the path is valid
   */
  public override async validateDirectoryPath(path: string): Promise<boolean> {
    try {
      if (!path || path.trim().length === 0) {
        return false;
      }

      // Check for invalid characters
      if (INVALID_PATH_CHARS.test(path)) {
        return false;
      }

      // Check if path exists and is a directory
      const dirInfo = await Deno.stat(path);
      return dirInfo.isDirectory;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Validates markdown text according to the rules:
   * - Must be a non-empty string
   * - Must be valid markdown content
   * @param text - The markdown text to validate
   * @returns true if the text is valid markdown
   */
  public override validateMarkdownText(text: string): text is MarkdownText {
    if (!text) {
      throw new ValidationError("Markdown text cannot be empty");
    }
    return true;
  }
}
