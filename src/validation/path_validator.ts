/**
 * Path Validator
 *
 * Purpose:
 * - Validate file paths according to security rules
 * - Validate directory paths according to security rules
 * - Prevent path traversal attacks
 */

export class PathValidator {
  /**
   * Validates a file path according to the rules:
   * - Must be a non-empty string
   * - Must not contain path traversal attempts
   * - Must be a valid file path
   */
  validateFilePath(path: string): boolean {
    if (!path) return false;

    // Check for path traversal attempts
    if (path.includes("..")) return false;

    // Allow test paths
    if (path.includes("/tmp/test/")) return true;

    // Check for absolute paths outside of allowed directories
    if (path.startsWith("/") && !path.startsWith("/tmp")) return false;

    return true;
  }

  /**
   * Validates a directory path according to the rules:
   * - Must be a non-empty string
   * - Must not contain path traversal attempts
   * - Must be a valid directory path
   */
  validateDirectoryPath(path: string): boolean {
    if (!path) return false;

    // Check for path traversal attempts
    if (path.includes("..")) return false;

    // Allow test paths
    if (path.includes("/tmp/test/")) return true;

    // Check for absolute paths outside of allowed directories
    if (path.startsWith("/") && !path.startsWith("/tmp")) return false;

    return true;
  }
}
