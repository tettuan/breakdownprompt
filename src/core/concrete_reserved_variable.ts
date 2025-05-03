/**
 * Concrete Reserved Variable
 *
 * Purpose:
 * - Implement specific validation and processing for reserved variables
 * - Extend base class functionality
 * - Handle concrete variable types
 *
 * Scope:
 * - Specific validation logic
 * - Specific conversion logic
 * - Error handling
 *
 * Implementation:
 * - Validation methods
 * - Conversion methods
 * - Error handling methods
 *
 * Error Handling:
 * - Invalid validation
 * - Invalid conversion
 * - Invalid error handling
 */

import { BaseReservedVariable } from "./base_reserved_variable.ts";
import { ValidationError } from "../errors.ts";

export class ConcreteReservedVariable extends BaseReservedVariable {
  constructor(name: string, type: string, value: unknown) {
    super(name, type, value);
  }

  // Specific validation
  /**
   * Validates the variable.
   *
   * @returns A promise that resolves to true if validation passes
   * @throws {ValidationError} If validation fails
   */
  validate(): Promise<boolean> {
    this.logger.debug("Validating concrete reserved variable", { name: this.name });

    if (!this.name || !this.type) {
      throw new ValidationError("Invalid concrete reserved variable");
    }

    return Promise.resolve(true);
  }

  // Specific processing
  async process(): Promise<unknown> {
    try {
      // Validate before processing
      await this.validate();

      // Normalize value
      const normalizedValue = this.normalizeValue();

      // Process based on type
      switch (this.type) {
        case "string":
          return String(normalizedValue);
        case "number":
          return Number(normalizedValue);
        case "boolean":
          return Boolean(normalizedValue);
        case "date":
          return new Date(normalizedValue as string | number);
        case "time":
          return new Date(normalizedValue as string | number);
        case "timestamp":
          return Number(normalizedValue);
        default:
          throw new ValidationError(`Invalid type: ${this.type}`);
      }
    } catch (error) {
      this.logger.error("Error processing concrete variable", error);
      throw error;
    }
  }
}
