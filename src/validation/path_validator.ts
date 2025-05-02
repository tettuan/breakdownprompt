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
import { dirname, normalize, resolve } from "@std/path";

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
  private allowedTempDirs: string[] = [];
  private currentDir: string;
  private initialized: Promise<void>;

  constructor() {
    this.currentDir = resolve(".");
    this.initialized = this.initializeTempDirs();
  }

  /**
   * Ensures the validator is initialized
   */
  private async ensureInitialized(): Promise<void> {
    try {
      await this.initialized;
    } catch (_error) {
      // If initialization fails, retry
      this.initialized = this.initializeTempDirs();
      await this.initialized;
    }
  }

  /**
   * Initializes allowed temp directories by detecting system temp dir
   */
  private async initializeTempDirs(): Promise<void> {
    try {
      // Try to detect temp directory from Deno.makeTempDir
      const tempDir = await Deno.makeTempDir();
      const parentDir = dirname(tempDir);
      this.allowedTempDirs = [parentDir];
      await Deno.remove(tempDir, { recursive: true });
    } catch (_error) {
      // If detection fails, use fallback directories
      this.allowedTempDirs = [
        "/tmp",
        "/var/tmp",
        "/private/var/folders",
        "/var/folders",
      ];
    }
  }

  /**
   * Checks if a path is a relative path
   * @param path - The path to check
   * @returns true if the path is relative
   */
  private isRelativePath(path: string): boolean {
    // Allow paths that:
    // 1. Start with './' or '../' (after normalization)
    // 2. Don't start with '/' (relative to current directory)
    // 3. Are not empty
    return Boolean(path) && !path.startsWith("/");
  }

  /**
   * Checks if a path is in an allowed directory
   * @param path - The path to check
   * @returns true if the path is in an allowed directory
   */
  private isAllowedPath(path: string): boolean {
    // If it's a relative path, it's always allowed
    if (this.isRelativePath(path)) {
      return true;
    }
    // For absolute paths, check if they're in allowed directories
    return this.allowedTempDirs.some((dir) => path.startsWith(dir + "/") || path === dir) ||
      path.startsWith(this.currentDir + "/") || path === this.currentDir;
  }

  /**
   * Normalizes and validates a file path
   * @param path - The file path to validate
   * @returns Normalized and validated path
   * @throws {ValidationError} If the path is invalid
   */
  async validateFilePath(path: string): Promise<string> {
    await this.ensureInitialized();

    // 1. Basic validation
    if (!path || path.trim() === "") {
      throw new ValidationError("Path cannot be empty");
    }

    // 2. Check for invalid characters
    const invalidChars = path.match(this.INVALID_CHARS_REGEX);
    if (invalidChars) {
      throw new ValidationError(`Path contains invalid characters: ${invalidChars[0]}`);
    }

    // 3. Check path length
    if (path.length > this.MAX_PATH_LENGTH) {
      throw new ValidationError(
        `Path exceeds maximum length of ${this.MAX_PATH_LENGTH} characters`,
      );
    }

    // 4. Check for directory traversal before normalization
    if (this.TRAVERSAL_REGEX.test(path)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 5. Normalize path
    const normalizedPath = this.normalizePath(path);

    // 6. Check for absolute paths
    if (!this.isAllowedPath(normalizedPath)) {
      throw new ValidationError(
        "Path is not allowed. Use relative paths or allowed absolute paths.",
      );
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
  async validateDirectoryPath(path: string): Promise<string> {
    await this.ensureInitialized();

    // 1. Basic validation
    if (!path || path.trim() === "") {
      throw new ValidationError("Path cannot be empty");
    }

    // 2. Check for invalid characters
    const invalidChars = path.match(this.INVALID_CHARS_REGEX);
    if (invalidChars) {
      throw new ValidationError(`Path contains invalid characters: ${invalidChars[0]}`);
    }

    // 3. Check path length
    if (path.length > this.MAX_PATH_LENGTH) {
      throw new ValidationError(
        `Path exceeds maximum length of ${this.MAX_PATH_LENGTH} characters`,
      );
    }

    // 4. Check for directory traversal before normalization
    if (this.TRAVERSAL_REGEX.test(path)) {
      throw new ValidationError("Path contains directory traversal (..)");
    }

    // 5. Normalize path
    const normalizedPath = this.normalizePath(path);

    // 6. Check for absolute paths
    if (normalizedPath.startsWith("/") && !this.isAllowedPath(normalizedPath)) {
      throw new ValidationError(
        "Absolute paths are not allowed. Please use relative paths instead.",
      );
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
