/**
 * Reserved Variable Validator
 *
 * Purpose:
 * - Validate reserved variable names and values
 * - Ensure proper type checking and format validation
 * - Handle reserved variable validation
 *
 * Background:
 * The ReservedVariableValidator is responsible for validating reserved variable names and values
 * according to the specified rules and types. All reserved variables are optional.
 */

import { ValidationError } from "../errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { TextContent as _TextContent } from "../types.ts";

// Define reserved variable names
const RESERVED_VARIABLES = new Set([
  "schema_file",
  "template_path",
  "output_dir",
  "config_file",
  "prompt_file_path",
]);

/**
 * A class for validating reserved variables and their values.
 * Provides methods to ensure reserved variables meet the required format and type constraints.
 */
export class ReservedVariableValidator {
  private logger: BreakdownLogger;
  private readonly VALID_KEY_REGEX = /^(uv-[a-zA-Z0-9_]+|[a-zA-Z][a-zA-Z0-9_]*)$/;

  constructor() {
    this.logger = new BreakdownLogger();
  }

  /**
   * Validates a reserved variable key
   * @param key - The key to validate
   * @returns true if the key is valid
   * @throws {ValidationError} If the key is invalid
   */
  validateKey(key: string): boolean {
    this.logger.debug("Validating reserved variable key", { key });

    if (!key || typeof key !== "string") {
      throw new ValidationError("Invalid reserved variable name");
    }

    if (!RESERVED_VARIABLES.has(key)) {
      throw new ValidationError(`Non-reserved variable not allowed: ${key}`);
    }

    if (!this.VALID_KEY_REGEX.test(key)) {
      if (key.includes("-")) {
        throw new ValidationError(
          `Invalid reserved variable name: ${key} (variable names cannot contain hyphens)`,
        );
      }
      throw new ValidationError(`Invalid reserved variable name: ${key}`);
    }

    return true;
  }

  /**
   * Validates a set of reserved variables
   * @param variables - The variables to validate
   * @returns void
   * @throws {ValidationError} If any variable is invalid
   */
  validateVariables(variables: Record<string, unknown>): void {
    this.logger.debug("Validating reserved variables", { variables });

    // First, validate all variable names and values
    for (const [key, value] of Object.entries(variables)) {
      try {
        this.validateKey(key);
      } catch (error) {
        throw error;
      }

      // Skip validation for empty values since all variables are optional
      if (value === undefined || value === null || value === "") {
        this.logger.debug(`Empty value for optional reserved variable: ${key}`);
        continue;
      }

      // Validate value type
      if (typeof value !== "string") {
        throw new ValidationError(`Invalid type for reserved variable: ${key}`);
      }
    }
  }
}
