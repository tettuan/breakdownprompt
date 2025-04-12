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
export abstract class VariableValidator {
  constructor() {
    // Remove the logger initialization
  }

  /**
   * Validates a variable name according to the rules:
   * - Only alphanumeric characters and underscores are allowed
   * - Must start with a letter
   * - Case sensitive
   */
  validateKey(key: string): key is ValidVariableKey {
    if (!key || key.trim().length === 0) {
      return false;
    }

    // Must start with a letter
    if (!/^[a-zA-Z]/.test(key)) {
      return false;
    }

    // Only alphanumeric characters and underscores allowed
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      return false;
    }

    return true;
  }

  /**
   * Validates a file path
   * - Must not be empty
   * - Must be a valid file path format
   * - Must exist and be readable
   */
  abstract validateFilePath(path: string): Promise<boolean>;

  /**
   * Validates a directory path
   * - Must not be empty
   * - Must be a valid directory path format
   * - Must exist and be writable
   */
  abstract validateDirectoryPath(path: string): Promise<boolean>;

  /**
   * Validates markdown text
   * - Must not be empty
   * - Must be valid markdown format
   */
  abstract validateMarkdownText(text: string): text is MarkdownText;

  /**
   * Validates a set of variables
   * - All variable names must be valid
   * - All variable values must be valid
   */
  async validateVariables(variables: Record<string, unknown>): Promise<boolean> {
    try {
      for (const [key, value] of Object.entries(variables)) {
        if (!this.validateKey(key)) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }

        if (typeof value !== "string") {
          throw new ValidationError(`Invalid value type for variable ${key}: expected string`);
        }

        // Type-specific validation
        if (key === "schema_file" || key === "input_markdown_file") {
          if (!await this.validateFilePath(value)) {
            throw new ValidationError(`Invalid file path for ${key}: ${value}`);
          }
        } else if (key === "destination_path") {
          if (!await this.validateDirectoryPath(value)) {
            throw new ValidationError(`Invalid directory path for ${key}: ${value}`);
          }
        } else if (key === "input_markdown") {
          if (!this.validateMarkdownText(value)) {
            throw new ValidationError(`Invalid markdown content for ${key}`);
          }
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
   * Validates a file path
   * - Must not be empty
   * - Must be a valid file path format
   * - Must exist and be readable
   */
  override async validateFilePath(path: string): Promise<boolean> {
    if (!path || path.trim().length === 0) {
      return false;
    }

    // Basic path format validation
    if (!/^[a-zA-Z0-9\/\._-]+$/.test(path)) {
      return false;
    }

    try {
      // Check if file exists and is readable
      const fileInfo = await Deno.stat(path);
      if (!fileInfo.isFile) {
        return false;
      }

      // Check read permission
      try {
        const file = await Deno.open(path, { read: true });
        try {
          return true;
        } finally {
          file.close();
        }
      } catch (error) {
        return false;
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
      } else {
      }
      return false;
    }
  }

  /**
   * Validates a directory path
   * - Must not be empty
   * - Must be a valid directory path format
   * - Must exist and be writable
   */
  override async validateDirectoryPath(path: string): Promise<boolean> {
    if (!path || path.trim().length === 0) {
      return false;
    }

    // Basic path format validation
    if (!/^[a-zA-Z0-9\/\._-]+$/.test(path)) {
      return false;
    }

    try {
      // Check if directory exists
      const dirInfo = await Deno.stat(path);
      if (!dirInfo.isDirectory) {
        return false;
      }

      // Check write permission
      try {
        const testFile = `${path}/.write_test_${Date.now()}`;
        await Deno.writeTextFile(testFile, "");
        await Deno.remove(testFile);
        return true;
      } catch (error) {
        return false;
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
      } else {
      }
      return false;
    }
  }

  /**
   * Validates markdown text
   * - Must not be empty
   * - Must be valid markdown format
   */
  override validateMarkdownText(text: string): text is MarkdownText {
    if (!text || text.trim().length === 0) {
      return false;
    }

    // Basic markdown validation
    // Check for common markdown elements
    const hasMarkdownElements = /^#|^\s*[-*+]\s|^\s*\d+\.\s|^\s*>\s|^\s*`|^\s*\*\*|^\s*__|^\s*\[|^\s*!\[/.test(text);
    if (!hasMarkdownElements) {
      return false;
    }

    return true;
  }
}
