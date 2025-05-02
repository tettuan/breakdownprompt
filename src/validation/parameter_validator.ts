/**
 * Parameter Validator
 *
 * Purpose:
 * - Validates input parameters for the breakdown prompt processor
 * - Ensures required parameters are present
 * - Validates file paths and variable names
 * - Handles edge cases and null/undefined values
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

interface Parameters {
  prompt_file_path?: string | null;
  variables?: Record<string, unknown> | null;
}

export class ParameterValidator {
  private logger: BreakdownLogger;

  constructor() {
    this.logger = new BreakdownLogger();
  }

  validate(params: Parameters | null | undefined): ValidationResult {
    // Check if params is null or undefined
    if (params === null || params === undefined) {
      return {
        isValid: false,
        error: "Required parameters are missing",
      };
    }

    // Check if params is empty
    if (Object.keys(params).length === 0) {
      return {
        isValid: false,
        error: "Required parameters are missing",
      };
    }

    // Check prompt_file_path
    if (!("prompt_file_path" in params)) {
      return {
        isValid: false,
        error: "prompt_file_path is required",
      };
    }

    // Check for null/undefined/empty values in prompt_file_path
    if (
      params.prompt_file_path === null ||
      params.prompt_file_path === undefined ||
      params.prompt_file_path.trim() === ""
    ) {
      return {
        isValid: false,
        error: "prompt_file_path cannot be empty",
      };
    }

    // Validate file path (prevent path traversal)
    if (params.prompt_file_path.includes("..")) {
      return {
        isValid: false,
        error: "File path contains path traversal patterns",
      };
    }

    // Variables are optional
    if (!params.variables) {
      return { isValid: true };
    }

    // Validate variable names and values if variables exist
    if (params.variables) {
      const varNames = Object.keys(params.variables);

      // Empty variables object is allowed
      if (varNames.length === 0) {
        return { isValid: true };
      }

      for (const varName of varNames) {
        // Check variable name
        if (!this.isValidVariableName(varName)) {
          return {
            isValid: false,
            error: `Invalid variable name: ${varName}`,
          };
        }

        // Check variable value
        const value = params.variables[varName];
        if (value === null || value === undefined || value === "") {
          return {
            isValid: false,
            error: `Variable value cannot be empty, null, or undefined: ${varName}`,
          };
        }
      }
    }

    return { isValid: true };
  }

  private isValidVariableName(name: string): boolean {
    // Variable names should be alphanumeric and underscore only
    // Also check for empty string
    return name.length > 0 && /^[a-zA-Z0-9_]+$/.test(name);
  }
}
