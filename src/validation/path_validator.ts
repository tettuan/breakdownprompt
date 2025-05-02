/**
 * Path Validator
 *
 * Purpose:
 * - Validate file paths according to security rules
 * - Validate directory paths according to security rules
 * - Prevent path traversal attacks
 * - Normalize paths for consistent validation
 *
 * @see {@link https://jsr.io/@tettuan/breakdownprompt/docs/path_validation.md} for detailed validation rules
 */

import { ValidationError } from "../errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { normalize } from "@std/path";

const _logger = new BreakdownLogger();

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
  private readonly MAX_PATH_LENGTH = 4096; // Maximum path length on most systems
  private readonly TRAVERSAL_REGEX = /(?:^|\/)\.\./;

  /**
   * Normalizes and validates a file path
   * @param path - The file path to validate
   * @returns Normalized and validated path
   * @throws {ValidationError} If the path is invalid
   */
  validateFilePath(path: string): string {
    // 1. Basic validation
    if (!path || path.trim() === "") {
      throw new ValidationError("Path cannot be empty");
    }

    // 2. Check for directory traversal before normalization
    if (this.TRAVERSAL_REGEX.test(path)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 3. Normalize path
    const normalizedPath = this.normalizePath(path);

    // 4. Check path length
    if (normalizedPath.length > this.MAX_PATH_LENGTH) {
      throw new ValidationError(
        `Path exceeds maximum length of ${this.MAX_PATH_LENGTH} characters`,
      );
    }

    // 5. Check for absolute paths
    if (normalizedPath.startsWith("/") || normalizedPath.startsWith("\\")) {
      throw new ValidationError("Absolute paths are not allowed. Please use relative paths instead.");
    }

    // 6. Check for invalid characters
    const invalidChars = normalizedPath.match(this.INVALID_CHARS_REGEX);
    if (invalidChars) {
      throw new ValidationError(`Path contains invalid characters: ${invalidChars.join(", ")}`);
    }

    // 7. Validate path format
    if (!this.VALID_PATH_REGEX.test(normalizedPath)) {
      throw new ValidationError(
        "Path contains invalid characters. Only alphanumeric, hyphen, underscore, dot, and forward slash are allowed.",
      );
    }

    // 8. Check for directory traversal after normalization
    if (this.TRAVERSAL_REGEX.test(normalizedPath)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 9. Check for directory traversal in path segments
    const segments = normalizedPath.split("/").filter((segment) => segment !== "");
    for (const segment of segments) {
      if (segment === "..") {
        throw new ValidationError("Path contains directory traversal (..)");
      }
      if (segment === ".") {
        throw new ValidationError("Path contains current directory reference (.)");
      }
    }

    return normalizedPath;
  }

  /**
   * Normalizes and validates a directory path
   * @param path - The directory path to validate
   * @returns Normalized and validated path
   * @throws {ValidationError} If the path is invalid
   */
  validateDirectoryPath(path: string): string {
    // 1. Basic validation
    if (!path || path.trim() === "") {
      throw new ValidationError("Path cannot be empty");
    }

    // 2. Check for directory traversal before normalization
    if (this.TRAVERSAL_REGEX.test(path)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 3. Normalize path
    const normalizedPath = this.normalizePath(path);

    // 4. Check path length
    if (normalizedPath.length > this.MAX_PATH_LENGTH) {
      throw new ValidationError(
        `Path exceeds maximum length of ${this.MAX_PATH_LENGTH} characters`,
      );
    }

    // 5. Check for absolute paths outside of /tmp
    if (normalizedPath.startsWith("/") && !normalizedPath.startsWith("/tmp")) {
      throw new ValidationError("Absolute paths are not allowed. Please use relative paths instead.");
    }

    // 6. Check for invalid characters
    const invalidChars = normalizedPath.match(this.INVALID_CHARS_REGEX);
    if (invalidChars) {
      throw new ValidationError(`Path contains invalid characters: ${invalidChars.join(", ")}`);
    }

    // 7. Validate path format
    if (!this.VALID_PATH_REGEX.test(normalizedPath)) {
      throw new ValidationError(
        "Path contains invalid characters. Only alphanumeric, hyphen, underscore, dot, and forward slash are allowed.",
      );
    }

    // 8. Check for directory traversal after normalization
    if (this.TRAVERSAL_REGEX.test(normalizedPath)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 9. Check for directory traversal in path segments
    const segments = normalizedPath.split("/").filter((segment) => segment !== "");
    for (const segment of segments) {
      if (segment === "..") {
        throw new ValidationError("Path contains directory traversal (..)");
      }
      if (segment === ".") {
        throw new ValidationError("Path contains current directory reference (.)");
      }
    }

    return normalizedPath;
  }

  /**
   * Normalizes a path
   * @param path - The path to normalize
   * @returns Normalized path
   * @throws {ValidationError} If the path contains null characters
   */
  private normalizePath(path: string): string {
    if (path.includes("\0")) {
      throw new ValidationError("Path contains null character (\\0)");
    }

    // Normalize the path using the standard library
    const normalizedPath = normalize(path);

    // Double-check for directory traversal after normalization
    if (this.TRAVERSAL_REGEX.test(normalizedPath)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    return normalizedPath;
  }
}
