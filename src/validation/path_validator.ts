/**
 * Path Validator
 *
 * Purpose:
 * - Validate file paths according to security rules
 * - Validate directory paths according to security rules
 * - Prevent path traversal attacks
 *
 * @see {@link https://jsr.io/@tettuan/breakdownprompt/docs/path_validation.md} for detailed validation rules
 */

import { ValidationError } from "../errors.ts";

/**
 * A class for validating file and directory paths.
 * Provides methods to ensure paths are secure and valid.
 *
 * @example
 * ```typescript
 * const validator = new PathValidator();
 *
 * // Validate file path
 * const isValidFile = validator.validateFilePath("test.txt");
 *
 * // Validate directory path
 * const isValidDir = validator.validateDirectoryPath("test_dir");
 * ```
 */
export class PathValidator {
  private readonly INVALID_CHARS_REGEX = /[<>"|?*\\\s]/;
  private readonly VALID_PATH_REGEX = /^[a-zA-Z0-9\/\-_\.]+$/;

  /**
   * Validates a file path according to the rules:
   * - Must be a non-empty string
   * - Must not contain path traversal attempts
   * - Must be a valid file path
   * - Must not contain invalid characters
   * - Must not be an absolute path (except for /tmp)
   *
   * @param path - The file path to validate
   * @returns true if the path is valid
   * @throws {ValidationError} If the path is invalid
   */
  validateFilePath(path: string): boolean {
    if (!path || path.trim().length === 0) {
      throw new ValidationError("Path cannot be empty");
    }

    // Check for invalid characters
    if (this.INVALID_CHARS_REGEX.test(path)) {
      throw new ValidationError("Invalid path: Contains invalid characters");
    }

    // Check for path traversal attempts
    if (path.includes("..")) {
      throw new ValidationError("Invalid path: Contains directory traversal");
    }

    // Check for absolute paths outside of /tmp
    if (path.startsWith("/") && !path.startsWith("/tmp")) {
      throw new ValidationError("Invalid path: Absolute paths are not allowed");
    }

    // Validate path format
    if (!this.VALID_PATH_REGEX.test(path)) {
      throw new ValidationError("Invalid path: Contains invalid characters");
    }

    return true;
  }

  /**
   * Validates a directory path according to the rules:
   * - Must be a non-empty string
   * - Must not contain path traversal attempts
   * - Must be a valid directory path
   * - Must not contain invalid characters
   * - Must not be an absolute path (except for /tmp)
   *
   * @param path - The directory path to validate
   * @returns true if the path is valid
   * @throws {ValidationError} If the path is invalid
   */
  validateDirectoryPath(path: string): boolean {
    if (!path || path.trim().length === 0) {
      throw new ValidationError("Path cannot be empty");
    }

    // Check for invalid characters
    if (this.INVALID_CHARS_REGEX.test(path)) {
      throw new ValidationError("Invalid path: Contains invalid characters");
    }

    // Check for path traversal attempts
    if (path.includes("..")) {
      throw new ValidationError("Invalid path: Contains directory traversal");
    }

    // Check for absolute paths outside of /tmp
    if (path.startsWith("/") && !path.startsWith("/tmp")) {
      throw new ValidationError("Invalid path: Absolute paths are not allowed");
    }

    // Validate path format
    if (!this.VALID_PATH_REGEX.test(path)) {
      throw new ValidationError("Invalid path: Contains invalid characters");
    }

    return true;
  }
}
