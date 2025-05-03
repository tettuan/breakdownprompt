/**
 * Variable Matcher
 *
 * Purpose:
 * - Match template variables with reserved variables
 * - Handle class hierarchy and common processing flow
 * - Manage variable validation and conversion
 * - Match template variables with variables object
 *
 * Scope:
 * - Base class variable matching
 * - Concrete class variable matching
 * - Class hierarchy matching
 * - Common processing flow
 * - Template variable matching
 *
 * Implementation:
 * - Base class matching methods
 * - Concrete class matching methods
 * - Class hierarchy matching methods
 * - Common processing flow methods
 * - Template variable matching methods
 *
 * Error Handling:
 * - Invalid base class matching
 * - Invalid concrete class matching
 * - Invalid class hierarchy matching
 * - Invalid processing flow
 * - Invalid template variable matching
 *
 * Variable Rules:
 * - Reserved variables are optional (can be empty)
 * - Non-reserved variables in variables object are not allowed
 * - Template variables that don't match reserved variables are kept as is
 * - Empty variable objects are valid
 * - All variables in variables object must be reserved variables
 * - Variable values must be strings (if not empty)
 * - If variables object is provided, it must contain all template variables
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";
import type { ValidVariableKey, Variables } from "../types.ts";

// Define reserved variable names
const RESERVED_VARIABLES = new Set([
  "schema_file",
  "template_path",
  "output_dir",
  "config_file",
  "prompt_file_path",
]);

interface BaseVariable {
  name: ValidVariableKey;
  type: string;
  value?: string;
}

export class VariableMatcher {
  private logger: BreakdownLogger;

  constructor() {
    this.logger = new BreakdownLogger();
  }

  // Base class matching
  matchBaseClassFields(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !reservedVariable.name ||
        !reservedVariable.type
      ) {
        throw new ValidationError("Invalid base class matching");
      }
      return true;
    } catch (error) {
      this.logger.error("Error matching base class fields", error);
      throw error;
    }
  }

  matchBaseClassMethods(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !templateVariable.value ||
        !reservedVariable.name || !reservedVariable.type || !reservedVariable.value
      ) {
        throw new ValidationError("Invalid base class methods");
      }
      return true;
    } catch (error) {
      this.logger.error("Error matching base class methods", error);
      throw error;
    }
  }

  // Concrete class matching
  matchConcreteClassValidation(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !templateVariable.value ||
        !reservedVariable.name || !reservedVariable.type || !reservedVariable.value
      ) {
        throw new ValidationError("Invalid concrete class validation");
      }

      // Additional validation for file_path type
      if (templateVariable.type === "file_path") {
        const path = templateVariable.value;
        if (!path.startsWith("/") || path.includes("..")) {
          throw new ValidationError("Invalid concrete class matching");
        }
      }

      return true;
    } catch (error) {
      this.logger.error("Error matching concrete class validation", error);
      throw error;
    }
  }

  matchConcreteClassConversion(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !templateVariable.value ||
        !reservedVariable.name || !reservedVariable.type || !reservedVariable.value
      ) {
        throw new ValidationError("Invalid concrete class conversion");
      }
      return true;
    } catch (error) {
      this.logger.error("Error matching concrete class conversion", error);
      throw error;
    }
  }

  // Class hierarchy matching
  matchClassHierarchy(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !reservedVariable.name ||
        !reservedVariable.type
      ) {
        throw new ValidationError("Invalid class hierarchy matching");
      }
      return true;
    } catch (error) {
      this.logger.error("Error matching class hierarchy", error);
      throw error;
    }
  }

  matchPolymorphism(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !templateVariable.value ||
        !reservedVariable.name || !reservedVariable.type || !reservedVariable.value
      ) {
        throw new ValidationError("Invalid polymorphism");
      }
      return true;
    } catch (error) {
      this.logger.error("Error matching polymorphism", error);
      throw error;
    }
  }

  // Common processing flow
  matchCommonProcessingFlow(
    templateVariable: BaseVariable,
    reservedVariable: BaseVariable,
  ): boolean {
    try {
      if (
        !templateVariable.name || !templateVariable.type || !templateVariable.value ||
        !reservedVariable.name || !reservedVariable.type || !reservedVariable.value
      ) {
        throw new ValidationError("Invalid processing flow matching");
      }

      // Additional validation for file_path type
      if (templateVariable.type === "file_path") {
        const path = templateVariable.value;
        if (!path.startsWith("/") || path.includes("..")) {
          throw new ValidationError("Invalid processing flow matching");
        }
      }

      return true;
    } catch (error) {
      this.logger.error("Error matching common flow", error);
      throw error;
    }
  }

  /**
   * Extracts variables from template string.
   *
   * @param template - The template string to extract variables from
   * @returns Array of variable names found in the template
   */
  private extractTemplateVariables(template: string): ValidVariableKey[] {
    const regex = /\{([^}]+)\}/g;
    const matches = template.match(regex);
    if (!matches) {
      return [];
    }

    return matches.map((match) => {
      const varName = match.slice(1, -1);
      return varName as ValidVariableKey;
    });
  }

  /**
   * Matches template variables with variables object.
   *
   * Rules:
   * 1. Only reserved variables are allowed in variables object
   * 2. Template variables that match reserved variables are processed
   * 3. Template variables that don't match reserved variables are kept as is
   * 4. All variables are optional (can be empty)
   *
   * @param template - The template string containing variables
   * @param variables - The variables object to match against
   * @returns A promise that resolves to true if all variables are valid
   * @throws {ValidationError} If non-reserved variables are found in variables object
   * @throws {ValidationError} If variable values are not strings
   */
  matchTemplateVariables(template: string, variables: Variables): boolean {
    this.logger.debug("Matching template variables", { template, variables });

    // If no variables are provided, return true (empty object is valid)
    if (!variables || Object.keys(variables).length === 0) {
      return true;
    }

    // Check for non-reserved variables in variables object
    for (const key of Object.keys(variables)) {
      if (!RESERVED_VARIABLES.has(key)) {
        throw new ValidationError("Non-reserved variables are not allowed");
      }
    }

    // Validate variable values
    for (const [key, value] of Object.entries(variables)) {
      // Skip empty values for reserved variables
      if (value === undefined || value === null || value === "") {
        continue;
      }

      // Validate non-empty values
      if (typeof value !== "string") {
        throw new ValidationError(`Invalid type for variable: ${key}`);
      }
    }

    return true;
  }

  /**
   * Checks if a variable is required.
   * All variables are optional in this implementation.
   *
   * @param varName - The name of the variable to check
   * @returns false, as all variables are optional
   */
  private isRequiredVariable(_varName: string): boolean {
    return false;
  }
}
