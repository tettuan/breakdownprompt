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
import type { TextContent } from "../types.ts";

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
   */
  public replaceVariables(content: TextContent, variables: Record<string, unknown>): TextContent {
    // First validate all variable names
    for (const [key] of Object.entries(variables)) {
      try {
        this.variableValidator.validateKey(key);
      } catch (error) {
        if (error instanceof ValidationError) {
          this.logger.error("Invalid variable name", { name: key });
          throw error;
        }
        throw error;
      }
    }

    // Convert all values to strings and validate them
    const stringVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(variables)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Convert value to string
      const stringValue = String(value);
      try {
        this.variableValidator.validateTextContent(stringValue);
        stringVariables[key] = stringValue;
      } catch (error) {
        if (error instanceof ValidationError) {
          this.logger.error("Invalid variable value", { name: key });
          throw error;
        }
        throw error;
      }
    }

    // Validate variables
    this.variableValidator.validateVariables(stringVariables);

    // Replace variables in template
    let result = content;
    const varRegex = /\{([^}]+)\}/g;
    let match;
    const matches = [];

    // Collect all matches first
    while ((match = varRegex.exec(content)) !== null) {
      matches.push(match);
    }

    // Process matches in reverse order to handle nested references correctly
    for (const match of matches.reverse()) {
      const varName = match[1].trim();
      const value = variables[varName];

      // For optional variables, replace with empty string if undefined or null
      if (value === undefined || value === null) {
        result = result.replace(`{${varName}}`, "") as TextContent;
        continue;
      }

      // Replace variable with its string value
      result = result.replace(`{${varName}}`, String(value)) as TextContent;
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
