/**
 * Variable Validator
 *
 * Purpose:
 * - Validate variable names and values
 * - Ensure variables meet specified rules
 * - Handle variable type checking
 * - Manage variable validation flow
 *
 * Scope:
 * - Variable name validation
 * - Variable value validation
 * - Variable type checking
 * - Variable validation flow
 *
 * Implementation:
 * - Variable name validation methods
 * - Variable value validation methods
 * - Variable type checking methods
 * - Variable validation flow methods
 *
 * Error Handling:
 * - Invalid variable names
 * - Invalid variable values
 * - Invalid variable types
 * - Invalid validation flow
 *
 * Background:
 * The VariableValidator is responsible for validating variable names and values
 * according to the specified rules and types.
 *
 * Variable Validation Rules:
 * 1. Reserved Variables
 *    - All reserved variables are optional
 *    - Empty values (undefined, null, "") are allowed
 *
 * 2. Template Variables
 *    - Variables referenced in templates are required
 *    - Empty values are not allowed
 *    - Variable names must follow strict format rules
 */

import { ValidationError } from "../errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { TextContent, ValidVariableKey } from "../types.ts";
import { TemplateError } from "../errors.ts";
import { ReservedVariableValidator } from "./reserved_variable_validator.ts";

/**
 * A class for validating variables and their values.
 * Provides methods to ensure variables meet the required format and type constraints.
 */
export class VariableValidator {
  private logger: BreakdownLogger;
  private readonly VALID_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
  private reservedVariableValidator: ReservedVariableValidator;

  constructor() {
    this.logger = new BreakdownLogger();
    this.reservedVariableValidator = new ReservedVariableValidator();
  }

  /**
   * Validates a variable key
   * @param key - The key to validate
   * @returns true if the key is valid
   * @throws {ValidationError} If the key is invalid
   */
  validateKey(key: string): key is ValidVariableKey {
    this.logger.debug("Validating variable key", { key });

    if (!key || typeof key !== "string") {
      throw new ValidationError("Invalid variable name");
    }

    if (!this.VALID_KEY_REGEX.test(key)) {
      if (key.includes("-")) {
        throw new ValidationError(
          `Invalid variable name: ${key} (variable names cannot contain hyphens)`,
        );
      }
      throw new ValidationError(`Invalid variable name: ${key}`);
    }

    return true;
  }

  /**
   * Validates text content
   * @param text - The text to validate
   * @param path - The current path of variable references
   * @returns true if the text is valid
   * @throws {ValidationError} If the text is invalid
   */
  validateTextContent(text: string, path: Set<string> = new Set<string>()): text is TextContent {
    this.logger.debug("Validating text content", { text });

    if (!text || typeof text !== "string") {
      throw new ValidationError("Invalid text content");
    }

    // Check for variable references in the text
    const varRegex = /\{([^}]+)\}/g;
    let match;
    const matches = [];

    // Collect all matches first
    while ((match = varRegex.exec(text)) !== null) {
      matches.push(match);
    }

    // Process matches in reverse order to handle nested references correctly
    for (const match of matches.reverse()) {
      const referencedVar = match[1].trim();
      // Check for circular reference
      if (path.has(referencedVar)) {
        throw new TemplateError("Circular variable reference detected");
      }
      // Validate referenced variable name if it's not already in path
      if (!path.has(referencedVar)) {
        try {
          this.validateKey(referencedVar);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(`Invalid variable name in reference: ${referencedVar}`);
          }
          throw error;
        }
      }
    }

    return true;
  }

  /**
   * Validates a set of variables
   * @param variables - The variables to validate
   * @param templateVariables - Optional set of variables referenced in template
   * @returns void
   * @throws {ValidationError} If any variable is invalid
   */
  validateVariables(
    variables: Record<string, unknown>,
    templateVariables?: Set<string>,
  ): void {
    this.logger.debug("Validating variables", { variables, templateVariables });

    // First validate reserved variables
    this.reservedVariableValidator.validateVariables(variables);

    // If template variables are provided, validate their presence and values
    if (templateVariables) {
      for (const varName of templateVariables) {
        if (!(varName in variables)) {
          throw new ValidationError(`Missing required variable: ${varName}`);
        }

        const value = variables[varName];
        if (value === undefined || value === null || value === "") {
          throw new ValidationError(`Empty value for required variable: ${varName}`);
        }
      }
    }
  }
}
