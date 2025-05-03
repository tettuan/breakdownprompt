/**
 * Base Reserved Variable
 *
 * Purpose:
 * - Provide common fields and methods for reserved variables
 * - Handle basic validation and processing
 * - Support class hierarchy
 *
 * Scope:
 * - Common fields (name, type)
 * - Common methods (validate, process)
 * - Protected methods (normalizeValue)
 *
 * Implementation:
 * - Field validation
 * - Method validation
 * - Value normalization
 *
 * Error Handling:
 * - Invalid field values
 * - Invalid method calls
 * - Invalid value normalization
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";

export abstract class BaseReservedVariable {
  protected logger: BreakdownLogger;
  protected name: string;
  protected type: string;
  protected value: unknown;

  constructor(name: string, type: string, value: unknown) {
    this.logger = new BreakdownLogger();
    this.name = name;
    this.type = type;
    this.value = value;
  }

  // Common field validation
  protected validateFields(): boolean {
    try {
      if (!this.name || !this.type) {
        throw new ValidationError("Invalid fields");
      }
      return true;
    } catch (error) {
      this.logger.error("Error validating fields", error);
      throw error;
    }
  }

  // Common method validation
  protected validateMethods(): boolean {
    try {
      if (!this.name || !this.type || !this.value) {
        throw new ValidationError("Invalid methods");
      }
      return true;
    } catch (error) {
      this.logger.error("Error validating methods", error);
      throw error;
    }
  }

  // Value normalization
  protected normalizeValue(): unknown {
    try {
      if (!this.value) {
        throw new ValidationError("Invalid value");
      }
      return this.value;
    } catch (error) {
      this.logger.error("Error normalizing value", error);
      throw error;
    }
  }

  // Abstract methods for concrete classes
  abstract validate(): Promise<boolean>;
  abstract process(): Promise<unknown>;
}
