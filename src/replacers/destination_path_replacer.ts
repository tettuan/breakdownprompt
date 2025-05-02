import type { ValidationError as _ValidationError } from "../errors.ts";
import type { DirectoryPath, VariableReplacer } from "../types.ts";
import { PathValidator } from "../validation/path_validator.ts";

/**
 * DestinationPathReplacer
 *
 * Purpose:
 * - Replace {destination_path} variables with validated directory paths
 * - Ensure directory paths are valid and accessible
 * - Prevent path traversal attacks
 */
export class DestinationPathReplacer implements VariableReplacer {
  private pathValidator: PathValidator;

  constructor() {
    this.pathValidator = new PathValidator();
  }

  /**
   * Validates a directory path according to the rules:
   * - Must be a valid directory path
   * - Must not contain path traversal attempts
   * - Must be accessible
   */
  validate(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }

    try {
      this.pathValidator.validateDirectoryPath(value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Replaces a destination path variable with its value
   * - Validates the path
   * - Returns the normalized path
   */
  replace(value: unknown): string {
    if (typeof value !== "string") {
      return "";
    }

    if (!this.validate(value)) {
      return "";
    }

    // Cast to DirectoryPath type after validation
    const directoryPath = value as DirectoryPath;
    return directoryPath;
  }
}
