/**
 * Variable Matcher
 *
 * Purpose:
 * - Match variables between templates and reserved variables
 * - Validate variable types and formats
 * - Handle variable matching errors
 *
 * Intent:
 * - Provide variable matching functionality
 * - Support type validation
 * - Handle error cases
 */

import type { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";

export interface VariableMatchResult {
  matched: string[];
  unmatched: string[];
}

export class VariableMatcher {
  private logger: BreakdownLogger;

  constructor(logger: BreakdownLogger) {
    this.logger = logger;
  }

  match(
    templateVariables: string[],
    reservedVariables: Record<string, { type: string; value: unknown }>,
  ): VariableMatchResult {
    this.logger.debug("Starting variable matching process");

    const matched: string[] = [];
    const unmatched: string[] = [];

    for (const variable of templateVariables) {
      // Validate variable name before matching
      if (!this.validateVariableName(variable)) {
        this.logger.debug(`Invalid variable name: ${variable}`);
        throw new ValidationError("Invalid variable name");
      }

      if (reservedVariables[variable]) {
        matched.push(variable);
        this.logger.debug(`Matched variable: ${variable}`);
      } else {
        unmatched.push(variable);
        this.logger.debug(`Unmatched variable: ${variable}`);
      }
    }

    this.logger.debug(
      `Matching complete. Matched: ${matched.length}, Unmatched: ${unmatched.length}`,
    );
    return { matched, unmatched };
  }

  validateVariableName(name: string): boolean {
    if (!name || typeof name !== "string") {
      throw new ValidationError("Invalid variable name");
    }

    // Variable names must start with a letter and can contain letters, numbers, and underscores
    const validNameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
    return validNameRegex.test(name);
  }

  validateVariableType(
    variable: { name: string; type: string; value: unknown },
  ): boolean {
    const { name, type, value } = variable;

    if (!this.validateVariableName(name)) {
      throw new ValidationError("Invalid variable name");
    }

    switch (type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !isNaN(value as number);
      case "boolean":
        return typeof value === "boolean";
      case "date":
        return value instanceof Date;
      case "time":
        return value instanceof Date;
      case "timestamp":
        return typeof value === "number" && value > 0;
      default:
        throw new ValidationError(`Invalid variable type: ${type}`);
    }
  }

  matchPattern(
    content: string,
    pattern: RegExp,
  ): string[] {
    const matches = content.match(pattern);
    return matches ? matches : [];
  }
}
