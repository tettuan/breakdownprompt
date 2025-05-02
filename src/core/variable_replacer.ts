/**
 * Variable Replacer
 *
 * Purpose:
 * - Handles variable replacement in templates
 * - Validates variable names and values
 * - Replaces variables with their values
 *
 * Note:
 * - Uses VariableValidator for validation
 * - Uses BreakdownLogger for debugging (only in tests)
 */

import type { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { VariableValidator } from "../validation/variable_validator.ts";
import { ValidationError } from "../errors.ts";

export class VariableReplacer {
  private readonly logger: BreakdownLogger;
  private readonly variableValidator: VariableValidator;

  constructor(logger: BreakdownLogger, variableValidator: VariableValidator) {
    this.logger = logger;
    this.variableValidator = variableValidator;
  }

  /**
   * Replaces variables in template content with their values
   * @param content Template content
   * @param variables Variables to replace
   * @returns Content with variables replaced
   * @throws {ValidationError} If any variable is invalid or missing
   */
  replaceVariables(content: string, variables: Record<string, unknown>): string {
    if (!content) {
      return "";
    }

    const variablePattern = /\{([^}]+)\}/g;
    let result = content;
    const requiredVariables = new Set<string>();
    const matches = Array.from(content.matchAll(variablePattern));
    const validVariables = new Map<string, string>();

    // First pass: collect all variables and validate names
    for (const match of matches) {
      const variableName = match[1].trim();
      requiredVariables.add(variableName);

      // Validate variable name
      try {
        this.variableValidator.validateKey(variableName);
      } catch (error) {
        this.logger.error("Invalid variable name", { name: variableName });
        throw error;
      }

      // Check for missing variables
      const value = variables[variableName];
      if (value === undefined || value === null) {
        this.logger.warn("Variable not found", { name: variableName });
        continue;
      }

      // Validate variable value
      if (typeof value !== "string") {
        this.logger.error("Invalid variable value", { name: variableName });
        throw new ValidationError("Invalid variable value");
      }

      try {
        this.variableValidator.validateTextContent(value);
        validVariables.set(variableName, value);
      } catch (error) {
        this.logger.error("Invalid variable value", { name: variableName });
        throw error;
      }
    }

    // Validate required variables
    try {
      this.variableValidator.validateRequiredVariables(
        Array.from(requiredVariables),
        variables,
      );
    } catch (error) {
      this.logger.error("Missing required variables", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    // Second pass: replace only valid variables
    for (const [variableName, value] of validVariables) {
      result = result.replace(`{${variableName}}`, value);
    }

    return result;
  }

  /**
   * Extracts variables from template content
   * @param content Template content
   * @returns Array of variable names
   */
  extractVariables(content: string): string[] {
    if (!content) {
      return [];
    }

    const variablePattern = /\{([^}]+)\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      variables.add(match[1].trim());
    }

    return Array.from(variables);
  }
}
