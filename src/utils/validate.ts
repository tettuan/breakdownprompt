/**
 * Utility functions for validating prompts and parameters.
 */

/**
 * Validates a string value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @throws Error if validation fails
 */
export function validateString(value: unknown, fieldName: string): void {
  if (typeof value !== "string") {
    throw new Error(`Invalid value for ${fieldName}: expected string, got ${typeof value}`);
  }
  if (!value.trim()) {
    throw new Error(`${fieldName} cannot be empty`);
  }
}

/**
 * Validates a boolean value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @throws Error if validation fails
 */
export function validateBoolean(value: unknown, fieldName: string): void {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid value for ${fieldName}: expected boolean, got ${typeof value}`);
  }
}

/**
 * Validates a function value.
 * @param value The value to validate
 * @param fieldName The name of the field being validated
 * @throws Error if validation fails
 */
export function validateFunction(value: unknown, fieldName: string): void {
  if (typeof value !== "function") {
    throw new Error(`Invalid value for ${fieldName}: expected function, got ${typeof value}`);
  }
} 