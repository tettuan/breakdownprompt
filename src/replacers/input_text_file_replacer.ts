import type { ValidationError as _ValidationError } from "../errors.ts";
import type { FilePath, VariableReplacer } from "../types.ts";
import { PathValidator } from "../validation/path_validator.ts";

/**
 * InputTextFileReplacer
 *
 * Purpose:
 * - Replace {input_text_file} variables with validated file paths
 * - Ensure file paths are valid and accessible
 * - Prevent path traversal attacks
 */
export class InputTextFileReplacer implements VariableReplacer {
  private pathValidator: PathValidator;

  constructor() {
    this.pathValidator = new PathValidator();
  }

  /**
   * Validates a text file path according to the rules:
   * - Must be a valid file path
   * - Must not contain path traversal attempts
   * - Must be accessible
   */
  validate(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }

    try {
      this.pathValidator.validateFilePath(value);
      return true;
    } catch (_error) {
      return false;
    }
  }

  /**
   * Replaces an input text file variable with its value
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

    // Cast to FilePath type after validation
    const filePath = value as FilePath;
    return filePath;
  }
}
