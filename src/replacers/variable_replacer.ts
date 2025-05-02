import type { ValidationError as _ValidationError } from "../errors.ts";
import type {
  DirectoryPath as _DirectoryPath,
  FilePath as _FilePath,
  TextContent as _TextContent,
  Variables,
  VariableValidator,
} from "../types.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const _logger = new BreakdownLogger();

/**
 * Options for variable replacement.
 * @interface VariableReplacerOptions
 */
export interface VariableReplacerOptions {
  /** Variables to use for replacement */
  variables: Variables;
  /** Validator for variable types */
  validator: VariableValidator;
}

/**
 * Result of variable replacement operation.
 * @interface VariableReplacerResult
 */
export interface VariableReplacerResult {
  /** Whether the replacement was successful */
  success: boolean;
  /** The prompt with variables replaced */
  prompt: string;
  /** Error message if the replacement failed */
  error?: string;
  /** List of variables that were replaced */
  replacedVariables?: string[];
  /** List of variables that could not be replaced */
  unresolvedVariables?: string[];
}

/**
 * VariableReplacer
 *
 * Purpose:
 * - Replace variables in text content
 * - Validate variable values
 * - Handle different variable types
 */
export class VariableReplacer implements VariableReplacer {
  private readonly variableValidator: VariableValidator;

  constructor(variableValidator: VariableValidator) {
    this.variableValidator = variableValidator;
  }

  /**
   * Validates a variable value according to the rules:
   * - Must be a string
   * - Must be a valid variable name
   */
  validate(value: unknown): Promise<boolean> {
    if (typeof value !== "string") {
      return Promise.resolve(false);
    }

    try {
      return Promise.resolve(this.variableValidator.validateKey(value));
    } catch {
      return Promise.resolve(false);
    }
  }

  /**
   * Replaces a variable with its value
   * - Validates the variable name
   * - Returns the normalized value
   */
  async replace(value: unknown): Promise<string> {
    if (typeof value !== "string") {
      return "";
    }

    if (!await this.validate(value)) {
      return "";
    }

    return value;
  }
}
