/**
 * Variable Validator
 *
 * Purpose:
 * - Validate variable names according to naming rules
 * - Validate variable values according to their types
 * - Ensure type safety for variables
 */

import { ValidationError } from "../errors.ts";
import type { Variables } from "../types.ts";

export class VariableValidator {
  /**
   * Validates a variable name according to the rules:
   * - Must start with a letter
   * - Can only contain letters, numbers, and underscores
   * - Case sensitive
   */
  validateKey(key: string): boolean {
    if (!key) return false;
    return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key);
  }

  /**
   * Validates a complete set of variables
   * - Checks each variable name
   * - Validates each variable value according to its type
   */
  validateVariables(variables: Variables): boolean {
    try {
      for (const [key, value] of Object.entries(variables)) {
        if (!this.validateKey(key)) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }

        if (typeof value !== "string") {
          throw new ValidationError(`Invalid value for variable: ${key}`);
        }
      }
      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ValidationError("Unknown validation error");
    }
  }
}
