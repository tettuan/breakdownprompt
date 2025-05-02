import type { ValidationError as _ValidationError } from "../errors.ts";
import type {
  DirectoryPath as _DirectoryPath,
  FilePath as _FilePath,
  TextContent as _TextContent,
  Variables,
  VariableValidator,
} from "../types.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

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
 * Base class for replacing variables in templates.
 * Provides common functionality for variable replacement and validation.
 */
export class VariableReplacer {
  private variables: Variables;
  private validator: VariableValidator;

  /**
   * Creates a new VariableReplacer instance
   * @param options - Configuration options for variable replacement
   */
  constructor(options: VariableReplacerOptions) {
    this.variables = options.variables;
    this.validator = options.validator;
  }

  /**
   * Replaces variables in a template with their corresponding values
   * @param template - The template string containing variables to replace
   * @returns Result containing the replaced template and any errors
   */
  replace(template: string): VariableReplacerResult {
    try {
      let result = template;
      const replacedVariables = new Set<string>();
      const unresolvedVariables = new Set<string>();

      // Find all variables in the template
      const variablePattern = /{([^}]+)}/g;
      const matches = Array.from(template.matchAll(variablePattern));

      for (const match of matches) {
        const variableName = match[1];

        // Validate the variable key
        try {
          if (!this.validator.validateKey(variableName)) {
            logger.debug(`Invalid variable key found: ${variableName}`);
            unresolvedVariables.add(variableName);
            continue;
          }
        } catch (_error) {
          logger.debug(`Invalid variable key found: ${variableName}`);
          unresolvedVariables.add(variableName);
          continue;
        }

        // Get the variable value
        const value = this.variables[variableName as keyof Variables];
        if (value === undefined) {
          logger.debug(`Variable not found in provided variables: ${variableName}`);
          unresolvedVariables.add(variableName);
          continue;
        }

        // Replace all occurrences of the variable
        const pattern = new RegExp(`{${variableName}}`, "g");
        result = result.replace(pattern, String(value));
        replacedVariables.add(variableName);
      }

      // Convert Sets to arrays for the return value
      const replacedArray = Array.from(replacedVariables);
      const unresolvedArray = Array.from(unresolvedVariables);

      return {
        success: unresolvedArray.length === 0,
        prompt: result,
        replacedVariables: replacedArray,
        unresolvedVariables: unresolvedArray.length > 0 ? unresolvedArray : undefined,
        error: unresolvedArray.length > 0
          ? `Unresolved variables found: ${unresolvedArray.join(", ")}`
          : undefined,
      };
    } catch (error) {
      logger.error(
        `Error during variable replacement: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      return {
        success: false,
        prompt: template,
        error: error instanceof Error ? error.message : "Unknown error during variable replacement",
      };
    }
  }
}
