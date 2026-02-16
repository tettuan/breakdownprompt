/**
 * Variable Replacer
 *
 * Purpose:
 * - Single definition point for the variable extraction regex
 * - Extract, validate, and replace template variables
 */

import type { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { VariableValidator } from "../validation/variable_validator.ts";
import { ValidationError } from "../errors.ts";
import type { TextContent } from "../types/variables.ts";

/** Single regex definition for matching template variables */
const VARIABLE_REGEX = /\{([^}]+)\}/g;

export interface ReplaceResult {
  content: string;
  replaced: string[];
  remaining: string[];
}

export class VariableReplacer {
  private readonly logger: BreakdownLogger;
  private readonly variableValidator: VariableValidator;

  constructor(logger: BreakdownLogger, variableValidator: VariableValidator) {
    this.logger = logger;
    this.variableValidator = variableValidator;
  }

  /**
   * Extracts variable names from template content.
   * @param content - Template content
   * @returns Array of unique variable names
   */
  extractVariables(content: string): string[] {
    if (!content) {
      return [];
    }
    const variables = new Set<string>();
    let match;
    const regex = new RegExp(VARIABLE_REGEX.source, VARIABLE_REGEX.flags);
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }
    return Array.from(variables);
  }

  /**
   * Validates all variable keys using the variable validator.
   * @param variables - Record of variable names to values
   * @throws {ValidationError} If any key is invalid
   */
  validateKeys(variables: Record<string, unknown>): void {
    for (const key of Object.keys(variables)) {
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
  }

  /**
   * Replaces all template variables with their values.
   * Returns a ReplaceResult with content, replaced, and remaining arrays.
   * @param content - Template content
   * @param variables - Variables to replace
   * @returns ReplaceResult with replaced content and variable tracking
   */
  replaceAll(
    content: string,
    variables: Record<string, string>,
  ): ReplaceResult {
    this.logger.debug("replaceAll called", {
      contentLength: content.length,
      variableKeys: Object.keys(variables),
    });

    const replaced: string[] = [];
    const remaining: string[] = [];

    const regex = new RegExp(VARIABLE_REGEX.source, VARIABLE_REGEX.flags);
    let match;
    const matches: Array<{ varName: string; fullMatch: string }> = [];

    while ((match = regex.exec(content)) !== null) {
      matches.push({ varName: match[1].trim(), fullMatch: match[0] });
    }

    let result = content;
    for (const { varName, fullMatch } of matches.reverse()) {
      this.logger.debug("Processing variable", { varName, fullMatch });
      if (
        varName in variables &&
        variables[varName] !== undefined &&
        variables[varName] !== null &&
        variables[varName].trim() !== ""
      ) {
        const value = variables[varName];
        this.logger.debug("Replacing variable", { varName, value });
        result = result.replace(
          new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          value,
        );
        replaced.push(varName);
      } else {
        this.logger.debug("Skipping variable (not found or empty)", {
          varName,
        });
        remaining.push(varName);
      }
    }

    this.logger.debug("replaceAll returning", {
      resultLength: result.length,
      replaced: replaced.length,
      remaining: remaining.length,
    });

    return { content: result, replaced, remaining };
  }

  /**
   * Replaces variables in template content with their values.
   * Undefined/null values are replaced with empty strings.
   * @param content - Template content
   * @param variables - Variables to replace (values may be unknown)
   * @returns Content with variables replaced
   */
  public replaceVariables(
    content: TextContent,
    variables: Record<string, unknown>,
  ): TextContent {
    this.logger.debug("replaceVariables called", {
      contentLength: content.length,
      variableKeys: Object.keys(variables),
    });

    // Validate all variable keys
    this.validateKeys(variables);

    // Validate non-null/undefined values
    const stringVariables: Record<string, string> = {};
    for (const [key, value] of Object.entries(variables)) {
      if (value === undefined || value === null) {
        continue;
      }
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

    // Validate variables as a group
    this.variableValidator.validateVariables(stringVariables);

    // Replace variables using regex
    const regex = new RegExp(VARIABLE_REGEX.source, VARIABLE_REGEX.flags);
    let match;
    const matches: Array<{ varName: string }> = [];

    while ((match = regex.exec(content)) !== null) {
      matches.push({ varName: match[1].trim() });
    }

    let result: string = content;
    for (const { varName } of matches.reverse()) {
      const value = variables[varName];

      if (value === undefined || value === null) {
        result = result.replace(`{${varName}}`, "");
        continue;
      }

      result = result.replace(`{${varName}}`, String(value));
    }

    this.logger.debug("replaceVariables returning", {
      resultLength: result.length,
    });
    return result as TextContent;
  }
}
