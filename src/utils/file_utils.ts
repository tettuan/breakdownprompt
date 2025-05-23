/**
 * File Utilities
 *
 * Purpose:
 * - Handle file existence checks
 * - Perform file read/write operations
 * - Check file permissions
 * - Delegate path normalization to PathValidator
 */

import { ValidationError } from "../errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PathValidator } from "../validation/path_validator.ts";
import { exists } from "@std/fs";
import { dirname, type fromFileUrl as _fromFileUrl, join, normalize, resolve } from "@std/path";
import { PermissionErrorMessages } from "../errors/permission_errors.ts";

const _logger = new BreakdownLogger();
const pathValidator = new PathValidator();

/**
 * A class for handling file operations
 */
export class FileUtils {
  /**
   * Checks if a file exists
   * @param path - The file path to check
   * @returns true if the file exists
   * @throws {ValidationError} If the path is invalid or access is denied
   */
  async exists(path: string): Promise<boolean> {
    try {
      const normalizedPath = await pathValidator.validateFilePath(path);
      const absolutePath = resolve(normalizedPath);
      return await exists(absolutePath);
    } catch (_error) {
      if (_error instanceof ValidationError) {
        throw _error;
      }
      throw new ValidationError("Failed to check file existence");
    }
  }

  /**
   * Reads the content of a file
   * @param path - The file path to read
   * @returns The file content
   * @throws {ValidationError} If the file cannot be read
   */
  async readFile(path: string): Promise<string> {
    try {
      const normalizedPath = await pathValidator.validateFilePath(path);
      const absolutePath = resolve(normalizedPath);
      return await Deno.readTextFile(absolutePath);
    } catch (_error) {
      if (_error instanceof ValidationError) {
        throw _error;
      }
      if (_error instanceof Deno.errors.NotFound) {
        throw new ValidationError(`Template not found: ${path}`);
      }
      if (_error instanceof Deno.errors.PermissionDenied) {
        throw new ValidationError(
          `${PermissionErrorMessages.READ_FILE}: Cannot read file at ${path} - check read permissions and file ownership`,
        );
      }
      throw new ValidationError(`Failed to read file: ${path}`);
    }
  }

  /**
   * Writes content to a file
   * @param path - The file path to write to
   * @param content - The content to write
   * @throws {ValidationError} If the file cannot be written
   */
  async writeFile(path: string, content: string): Promise<void> {
    try {
      const normalizedPath = await pathValidator.validateFilePath(path);
      const absolutePath = resolve(normalizedPath);
      await Deno.writeTextFile(absolutePath, content);
    } catch (_error) {
      if (_error instanceof ValidationError) {
        throw _error;
      }
      if (_error instanceof Deno.errors.PermissionDenied) {
        throw new ValidationError(
          `${PermissionErrorMessages.WRITE_FILE}: Cannot write to file at ${path} - check write permissions and file ownership`,
        );
      }
      throw new ValidationError("Failed to write file");
    }
  }

  /**
   * Checks if a directory exists
   * @param path - The directory path to check
   * @returns true if the directory exists
   * @throws {ValidationError} If the path is invalid or access is denied
   */
  async directoryExists(path: string): Promise<boolean> {
    try {
      const normalizedPath = await pathValidator.validateDirectoryPath(path);
      const absolutePath = resolve(normalizedPath);
      return await exists(absolutePath);
    } catch (_error) {
      if (_error instanceof ValidationError) {
        throw _error;
      }
      throw new ValidationError("Failed to check directory existence");
    }
  }

  /**
   * Normalizes a file path
   * @param path - The path to normalize
   * @returns The normalized path
   * @throws {ValidationError} If the path is invalid
   */
  normalizePath(path: string): string {
    try {
      return normalize(path);
    } catch (_error) {
      throw new ValidationError("Failed to normalize path");
    }
  }

  /**
   * Joins multiple path segments
   * @param paths - The path segments to join
   * @returns The joined path
   * @throws {ValidationError} If any path segment is invalid
   */
  joinPaths(...paths: string[]): string {
    try {
      return join(...paths);
    } catch (_error) {
      throw new ValidationError("Failed to join paths");
    }
  }

  /**
   * Gets the directory name from a path
   * @param path - The path to get the directory name from
   * @returns The directory name
   * @throws {ValidationError} If the path is invalid
   */
  getDirname(path: string): string {
    try {
      return dirname(path);
    } catch (_error) {
      throw new ValidationError("Failed to get directory name");
    }
  }
}
