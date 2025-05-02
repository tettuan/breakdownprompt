/**
 * Reserved Variable Validator
 *
 * Purpose:
 * - Validate reserved variable definitions and types
 * - Ensure proper handling of reserved variable validation
 * - Handle validation errors
 *
 * Intent:
 * - Provide reserved variable validation functionality
 * - Support type validation
 * - Handle error cases
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";

interface ReservedVariable {
  name: string;
  type: string;
  value: unknown;
}

export class ReservedVariableValidator {
  private logger: BreakdownLogger;
  private readonly VALID_NAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  private readonly VALID_TYPES = ["date", "time", "timestamp", "string", "number", "boolean"];

  constructor() {
    this.logger = new BreakdownLogger();
  }

  validateDefinition(definition: { name: string; type: string }): boolean {
    this.logger.debug("Validating reserved variable definition", { definition });

    if (!definition.name || typeof definition.name !== "string") {
      throw new ValidationError("Invalid reserved variable definition");
    }

    if (!this.VALID_NAME_REGEX.test(definition.name)) {
      throw new ValidationError("Invalid reserved variable definition");
    }

    if (!definition.type || typeof definition.type !== "string") {
      throw new ValidationError("Invalid reserved variable definition");
    }

    if (!this.VALID_TYPES.includes(definition.type)) {
      throw new ValidationError("Invalid reserved variable definition");
    }

    return true;
  }

  validateType(variable: ReservedVariable): boolean {
    this.logger.debug("Validating reserved variable type", { variable });

    if (!this.validateDefinition({ name: variable.name, type: variable.type })) {
      throw new ValidationError("Invalid reserved variable type");
    }

    switch (variable.type) {
      case "date":
      case "time":
        if (!(variable.value instanceof Date)) {
          throw new ValidationError("Invalid reserved variable type");
        }
        break;
      case "timestamp":
        if (typeof variable.value !== "number" || variable.value <= 0) {
          throw new ValidationError("Invalid reserved variable type");
        }
        break;
      case "string":
        if (typeof variable.value !== "string") {
          throw new ValidationError("Invalid reserved variable type");
        }
        break;
      case "number":
        if (typeof variable.value !== "number" || isNaN(variable.value)) {
          throw new ValidationError("Invalid reserved variable type");
        }
        break;
      case "boolean":
        if (typeof variable.value !== "boolean") {
          throw new ValidationError("Invalid reserved variable type");
        }
        break;
      default:
        throw new ValidationError("Invalid reserved variable type");
    }

    return true;
  }

  validateValue(variable: ReservedVariable): boolean {
    this.logger.debug("Validating reserved variable value", { variable });

    // First validate the definition
    this.validateDefinition({ name: variable.name, type: variable.type });

    // Then check value-specific constraints
    if (variable.value === null || variable.value === undefined) {
      throw new ValidationError("Invalid reserved variable value");
    }

    if (
      variable.type === "string" && typeof variable.value === "string" &&
      variable.value.trim() === ""
    ) {
      throw new ValidationError("Invalid reserved variable value");
    }

    if (variable.type === "timestamp" && typeof variable.value === "number" && variable.value < 0) {
      throw new ValidationError("Invalid reserved variable value");
    }

    // Finally validate the type
    switch (variable.type) {
      case "date":
      case "time":
        if (!(variable.value instanceof Date)) {
          throw new ValidationError("Invalid reserved variable value");
        }
        break;
      case "timestamp":
        if (typeof variable.value !== "number" || variable.value <= 0) {
          throw new ValidationError("Invalid reserved variable value");
        }
        break;
      case "string":
        if (typeof variable.value !== "string") {
          throw new ValidationError("Invalid reserved variable value");
        }
        break;
      case "number":
        if (typeof variable.value !== "number" || isNaN(variable.value)) {
          throw new ValidationError("Invalid reserved variable value");
        }
        break;
      case "boolean":
        if (typeof variable.value !== "boolean") {
          throw new ValidationError("Invalid reserved variable value");
        }
        break;
      default:
        throw new ValidationError("Invalid reserved variable value");
    }

    return true;
  }
}
