/**
 * Variable Validator
 *
 * Purpose:
 * - Validate variable names and values
 * - Ensure proper type checking and format validation
 * - Handle required variable validation
 *
 * Background:
 * The VariableValidator is responsible for validating variable names and values
 * according to the specified rules and types.
 */

import { ValidationError } from "../errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { TextContent, ValidVariableKey } from "../types.ts";
import { TemplateError } from "../errors.ts";

/**
 * A class for validating variables and their values.
 * Provides methods to ensure variables meet the required format and type constraints.
 */
export class VariableValidator {
  private logger: BreakdownLogger;
  private readonly VALID_KEY_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;

  constructor() {
    this.logger = new BreakdownLogger();
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

    if (key.includes("-")) {
      throw new ValidationError(
        `Invalid variable name: ${key} (variable names cannot contain hyphens)`,
      );
    }

    if (!this.VALID_KEY_REGEX.test(key)) {
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
      // Skip conditional blocks
      if (referencedVar.startsWith("#if ") || referencedVar === "/if") {
        continue;
      }
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
   * Validates required variables
   * @param required - List of required variable names
   * @param variables - Variables to validate
   * @returns true if all required variables are present
   * @throws {ValidationError} If any required variable is missing
   */
  validateRequiredVariables(required: string[], variables: Record<string, unknown>): void {
    this.logger.debug("Validating required variables", { required, variables });

    const missingVars = required.filter((varName) => {
      if (varName.startsWith("#if ") || varName === "/if") {
        return false;
      }
      return !(varName in variables);
    });

    if (missingVars.length > 0) {
      throw new ValidationError(`Missing required variables: ${missingVars.join(", ")}`);
    }

    for (const key of required) {
      if (key.startsWith("#if ") || key === "/if") {
        continue;
      }

      const value = variables[key];
      if (
        value === null || value === undefined || (typeof value === "string" && value.trim() === "")
      ) {
        throw new ValidationError(`Invalid value for required variable: ${key}`);
      }
    }
  }

  /**
   * Validates a set of variables
   * @param variables - The variables to validate
   * @returns true if all variables are valid
   * @throws {ValidationError} If any variable is invalid
   */
  validateVariables(variables: Record<string, string>): void {
    this.logger.debug("Validating variables", { variables });

    // First, validate all variable names and values
    for (const [key, value] of Object.entries(variables)) {
      try {
        this.validateKey(key);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }
        throw error;
      }

      if (value === undefined || value === null || value.trim() === "") {
        throw new ValidationError(`Invalid value for variable: ${key}`);
      }
    }

    // Then check for circular references
    const visited = new Set<string>();
    const resolving = new Set<string>();

    const checkCircularReferences = (key: string, path = new Set<string>()): void => {
      if (path.has(key)) {
        throw new TemplateError("Circular variable reference detected");
      }

      if (resolving.has(key)) {
        throw new TemplateError("Circular variable reference detected");
      }

      if (visited.has(key)) {
        return;
      }

      const value = variables[key];
      if (value === null || value === undefined || value.trim() === "") {
        throw new ValidationError(`Invalid value for variable: ${key}`);
      }

      resolving.add(key);
      path.add(key);

      try {
        // Check for variable references in the value
        const varRegex = /\{\{([^}]+)\}\}/g;
        let match;
        while ((match = varRegex.exec(value)) !== null) {
          const referencedVar = match[1].trim();
          // Skip conditional blocks
          if (referencedVar.startsWith("#if ") || referencedVar === "/if") {
            continue;
          }
          // Check for circular references
          if (referencedVar in variables) {
            checkCircularReferences(referencedVar, path);
          }
        }
      } finally {
        resolving.delete(key);
        path.delete(key);
        visited.add(key);
      }
    };

    // Check each variable for circular references
    for (const key of Object.keys(variables)) {
      if (!visited.has(key)) {
        checkCircularReferences(key);
      }
    }

    // Also validate each variable's text content
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === "string") {
        try {
          this.validateTextContent(value);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(`Invalid text content in variable ${key}: ${error.message}`);
          }
          throw error;
        }
      }
    }
  }
}
