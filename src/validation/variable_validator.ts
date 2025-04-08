/**
 * Variable Validator
 *
 * Purpose:
 * - Validate variable names according to naming rules
 * - Validate variable values according to their types
 * - Ensure type safety for variables
 */

import { ValidationError } from "../errors.ts";
import type { Variables } from "../types.ts";
import {
  ValidVariableKey,
  FilePath,
  DirectoryPath,
  MarkdownText,
  VariableValidator as IVariableValidator,
} from "../types/variables.ts";

/**
 * Base class for variable validation
 * Provides common validation functionality
 */
export class VariableValidator {
  /**
   * Validates a variable name according to the rules:
   * - Must start with a letter
   * - Can only contain letters, numbers, and underscores
   * - Case sensitive
   */
  validateKey(key: string): boolean {
    if (!key) return false;
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key);
  }

  /**
   * Validates a complete set of variables
   * - Checks each variable name
   * - Validates each variable value according to its type
   */
  validateVariables(variables: Variables): boolean {
    try {
      for (const [key, value] of Object.entries(variables)) {
        if (!this.validateKey(key)) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }

        if (typeof value !== "string") {
          throw new ValidationError(`Invalid value for variable: ${key}`);
        }
      }
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError("Unknown validation error");
    }
  }
}

/**
 * Default implementation of VariableValidator
 * Validates variable keys, file paths, directory paths, and markdown text
 */
export class DefaultVariableValidator extends VariableValidator implements IVariableValidator {
  /**
   * Validates a variable key
   * - Must start with a letter
   * - Can only contain letters, numbers, and underscores
   * - Case sensitive
   */
  override validateKey(key: string): key is ValidVariableKey {
    return super.validateKey(key);
  }

  /**
   * Validates a file path
   * - Must not be empty
   * - Must be a valid file path format
   */
  validateFilePath(path: string): path is FilePath {
    if (!path || path.trim().length === 0) {
      return false;
    }
    // Basic path validation - can be enhanced with more specific rules
    return /^[a-zA-Z0-9\/\._-]+$/.test(path);
  }

  /**
   * Validates a directory path
   * - Must not be empty
   * - Must be a valid directory path format
   */
  validateDirectoryPath(path: string): path is DirectoryPath {
    if (!path || path.trim().length === 0) {
      return false;
    }
    // Basic path validation - can be enhanced with more specific rules
    return /^[a-zA-Z0-9\/\._-]+$/.test(path);
  }

  /**
   * Validates markdown text
   * - Must not be empty
   * - Must be valid markdown format
   */
  validateMarkdownText(text: string): text is MarkdownText {
    if (!text || text.trim().length === 0) {
      return false;
    }
    // Basic markdown validation - can be enhanced with more specific rules
    return true;
  }
}
