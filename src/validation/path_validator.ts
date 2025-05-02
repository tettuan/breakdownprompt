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
import { fromFileUrl, isAbsolute, normalize } from "@std/path";

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
  private readonly allowedPrefixes: string[];
  private readonly INVALID_CHARS_REGEX = /[<>:"|?*\\]/;
  private readonly VALID_PATH_REGEX = /^[a-zA-Z0-9\-_.\/]+$/;
  private readonly MAX_PATH_LENGTH = 4096;
  private readonly TRAVERSAL_REGEX = /(?:^|\/)\.\./;

  constructor() {
    // Get system temp directory from Deno environment
    const tempDir = Deno.env.get("TMPDIR") || "/tmp";

    // Initialize with system temp directory and current directory
    this.allowedPrefixes = [
      "/tmp",
      "/var/tmp",
      "/private/var/folders",
      "/var/folders",
      tempDir,
      Deno.cwd(),
    ];

    _logger.debug(`Allowed prefixes: ${this.allowedPrefixes.join(", ")}`);
  }

  /**
   * Validates a file path
   * @param path - The path to validate
   * @returns Promise<string> - The normalized path if valid
   * @throws {ValidationError} If the path is invalid
   */
  async validateFilePath(path: string): Promise<string> {
    try {
      await this.validatePath(path);
      return this.normalizePath(path);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError("Invalid file path");
    }
  }

  /**
   * Validates a directory path
   * @param path - The path to validate
   * @returns Promise<string> - The normalized path if valid
   * @throws {ValidationError} If the path is invalid
   */
  async validateDirectoryPath(path: string): Promise<string> {
    try {
      await this.validatePath(path);
      return this.normalizePath(path);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError("Invalid directory path");
    }
  }

  /**
   * Adds an allowed absolute path prefix
   * @param prefix - The absolute path prefix to allow
   * @throws {ValidationError} If the prefix is invalid
   */
  addAllowedPrefix(prefix: string): void {
    try {
      const normalizedPrefix = this.normalizePath(prefix);
      if (!isAbsolute(normalizedPrefix)) {
        throw new ValidationError("Prefix must be an absolute path");
      }
      this.allowedPrefixes.push(normalizedPrefix);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError("Invalid prefix path");
    }
  }

  /**
   * Internal path validation logic
   * @param path - The path to validate
   * @returns Promise<void>
   * @throws {ValidationError} If the path is invalid
   * @private
   */
  private validatePath(path: string): Promise<void> {
    // 1. Basic validation
    if (!path || path.trim() === "") {
      throw new ValidationError("Path cannot be empty");
    }

    // 2. Check for directory traversal
    if (this.containsDirectoryTraversal(path)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 3. Check for invalid characters
    const invalidChars = path.match(this.INVALID_CHARS_REGEX);
    if (invalidChars) {
      throw new ValidationError(`Path contains invalid characters: ${invalidChars[0]}`);
    }

    // 4. Check path length
    if (path.length > this.MAX_PATH_LENGTH) {
      throw new ValidationError(
        `Path exceeds maximum length of ${this.MAX_PATH_LENGTH} characters`,
      );
    }

    // 5. Normalize path
    const normalizedPath = this.normalizePath(path);

    // 6. Check for absolute paths
    if (isAbsolute(normalizedPath)) {
      const isAllowed = this.allowedPrefixes.some((prefix) => normalizedPath.startsWith(prefix));
      if (!isAllowed) {
        throw new ValidationError(
          "Absolute paths are not allowed. Please use relative paths instead.",
        );
      }
    }

    // 7. Validate path format
    if (!this.VALID_PATH_REGEX.test(normalizedPath)) {
      const invalidChar = normalizedPath.match(/[^a-zA-Z0-9\-_./]/)?.[0] || "";
      throw new ValidationError(`Path contains invalid characters: ${invalidChar}`);
    }

    return Promise.resolve();
  }

  /**
   * Normalizes a path
   * @param path - The path to normalize
   * @returns string - The normalized path
   * @private
   */
  private normalizePath(path: string): string {
    try {
      if (path.startsWith("file://")) {
        return fromFileUrl(path);
      }
      return normalize(path);
    } catch (_error) {
      throw new ValidationError("Failed to normalize path");
    }
  }

  /**
   * Checks for directory traversal in a path
   * @param path - The path to check
   * @returns true if the path contains directory traversal
   * @private
   */
  private containsDirectoryTraversal(path: string): boolean {
    return path.includes("..");
  }
}
