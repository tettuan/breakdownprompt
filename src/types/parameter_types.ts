/**
 * Parameter Types
 * 
 * @module ParameterTypes
 * @description
 * This module defines types for parameters and their processed results.
 * It ensures type safety in parameter processing and provides clear interfaces
 * for working with different types of parameter values.
 */

/**
 * Basic parameter types that can be used in parameters.
 * 
 * @type {BasicParameterValue}
 * @description
 * Represents the basic types that can be used as parameter values:
 * - string: Text values
 * - number: Numeric values
 * - boolean: True/false values
 * 
 * @example
 * ```typescript
 * const param: BasicParameterValue = "Hello"; // string
 * const num: BasicParameterValue = 42;        // number
 * const flag: BasicParameterValue = true;     // boolean
 * ```
 */
export type BasicParameterValue = string | number | boolean;

/**
 * Complex parameter types that can contain nested objects.
 * 
 * @interface ComplexParameterValue
 * @description
 * Represents complex parameter values that can contain nested objects.
 * Each key can map to either a basic value or another complex value.
 * 
 * @example
 * ```typescript
 * const complex: ComplexParameterValue = {
 *   name: "John",                    // BasicParameterValue
 *   address: {                       // Nested ComplexParameterValue
 *     street: "123 Main St",
 *     city: "New York"
 *   }
 * };
 * ```
 */
export interface ComplexParameterValue {
  [key: string]: BasicParameterValue | ComplexParameterValue;
}

/**
 * Parameters that can be processed by the ParameterManager.
 * 
 * @interface Parameters
 * @description
 * Represents a collection of parameters where each key maps to either
 * a basic value or a complex value.
 * 
 * @example
 * ```typescript
 * const params: Parameters = {
 *   name: "John",                    // BasicParameterValue
 *   age: 30,                         // BasicParameterValue
 *   address: {                       // ComplexParameterValue
 *     street: "123 Main St",
 *     city: "New York"
 *   }
 * };
 * ```
 */
export interface Parameters {
  [key: string]: BasicParameterValue | ComplexParameterValue;
}

/**
 * User parameter structure
 */
export interface UserParameters extends ComplexParameterValue {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
  [key: string]: BasicParameterValue | ComplexParameterValue;
}

/**
 * Processed parameters with their resolved values
 */
export type ProcessedParameters = Parameters & {
  user?: UserParameters;
};
