import { ValidationError } from "../errors.ts";
import type { FilePath, VariableReplacer } from "../types.ts";
import { PathValidator } from "../validation/path_validator.ts";

/**
 * SchemaFileReplacer
 *
 * Purpose:
 * - Replace {schema_file} variables with validated file paths
 * - Ensure file paths are valid and accessible
 * - Prevent path traversal attacks
 */
export class SchemaFileReplacer implements VariableReplacer {
  private pathValidator: PathValidator;

  constructor() {
    this.pathValidator = new PathValidator();
  }

  /**
   * Validates a schema file path according to the rules:
   * - Must be a valid file path
   * - Must not contain path traversal attempts
   * - Must be accessible
   */
  validate(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }

    return this.pathValidator.validateFilePath(value);
  }

  /**
   * Replaces a schema file variable with its value
   * - Validates the path
   * - Returns the normalized path
   */
  replace(value: unknown): string {
    if (typeof value !== "string") {
      throw new ValidationError("Schema file path must be a string");
    }

    if (!this.validate(value)) {
      throw new ValidationError("Invalid schema file path");
    }

    // Cast to FilePath type after validation
    const filePath = value as FilePath;
    return filePath;
  }
}
