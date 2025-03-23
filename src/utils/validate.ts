/**
 * Custom error class for validation errors.
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public fieldName: string,
    public expectedType: string,
    public actualType: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Utility functions for validating prompts and parameters.
 */

/**
 * Validates a string value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @throws {ValidationError} If validation fails
 */
export function validateString(value: unknown, fieldName: string): void {
  if (typeof value !== "string") {
    throw new ValidationError(
      `Invalid value for ${fieldName}: expected string, got ${typeof value}`,
      fieldName,
      "string",
      typeof value,
    );
  }
  if (!value.trim()) {
    throw new ValidationError(
      `${fieldName} cannot be empty`,
      fieldName,
      "non-empty string",
      "empty string",
    );
  }
}

/**
 * Validates a boolean value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @throws {ValidationError} If validation fails
 */
export function validateBoolean(value: unknown, fieldName: string): void {
  if (typeof value !== "boolean") {
    throw new ValidationError(
      `Invalid value for ${fieldName}: expected boolean, got ${typeof value}`,
      fieldName,
      "boolean",
      typeof value,
    );
  }
}

/**
 * Validates a function value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @throws {ValidationError} If validation fails
 */
export function validateFunction(value: unknown, fieldName: string): void {
  if (typeof value !== "function") {
    throw new ValidationError(
      `Invalid value for ${fieldName}: expected function, got ${typeof value}`,
      fieldName,
      "function",
      typeof value,
    );
  }
}

/**
 * Validates a number value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @param options Optional validation options
 * @throws {ValidationError} If validation fails
 */
export function validateNumber(
  value: unknown,
  fieldName: string,
  options?: { min?: number; max?: number },
): void {
  if (typeof value !== "number" || isNaN(value)) {
    throw new ValidationError(
      `Invalid value for ${fieldName}: expected number, got ${typeof value}`,
      fieldName,
      "number",
      typeof value,
    );
  }

  if (options?.min !== undefined && value < options.min) {
    throw new ValidationError(
      `${fieldName} must be at least ${options.min}`,
      fieldName,
      `number >= ${options.min}`,
      String(value),
    );
  }

  if (options?.max !== undefined && value > options.max) {
    throw new ValidationError(
      `${fieldName} must be at most ${options.max}`,
      fieldName,
      `number <= ${options.max}`,
      String(value),
    );
  }
}
