/**
 * Parameter Types
 *
 * Purpose:
 * - Define types for parameters and their processed results
 * - Ensure type safety in parameter processing
 */

/**
 * Basic parameter types that can be used in parameters
 */
export type BasicParameterValue = string | number | boolean;

/**
 * Complex parameter types that can contain nested objects
 */
export interface ComplexParameterValue {
  [key: string]: BasicParameterValue | ComplexParameterValue;
}

/**
 * Parameters that can be processed by the ParameterManager
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
