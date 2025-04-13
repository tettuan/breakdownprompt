import type { ValidationError as _ValidationError } from "../errors.ts";

/**
 * Options for variable replacement.
 * @interface VariableReplacerOptions
 */
export interface VariableReplacerOptions {
  /** Variables to use for replacement */
  variables: Record<string, string>;
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
}

/**
 * Base class for replacing variables in templates.
 * Provides common functionality for variable replacement and validation.
 */
export class VariableReplacer {
  private variables: Record<string, string>;

  /**
   * Creates a new VariableReplacer instance
   * @param options - Configuration options for variable replacement
   */
  constructor(options: VariableReplacerOptions) {
    this.variables = options.variables;
  }

  /**
   * Replaces variables in a template with their corresponding values
   * @param template - The template string containing variables to replace
   * @returns Result containing the replaced template and any errors
   */
  replace(template: string): VariableReplacerResult {
    try {
      let result = template;

      // Replace all variables in the template
      for (const [key, value] of Object.entries(this.variables)) {
        const pattern = new RegExp(`{${key}}`, "g");
        result = result.replace(pattern, value);
      }

      // Check if there are any remaining unreplaced variables
      const remainingVars = result.match(/{[^}]+}/g);
      if (remainingVars) {
        return {
          success: false,
          prompt: result,
          error: `Unresolved variables found: ${remainingVars.join(", ")}`,
        };
      }

      return {
        success: true,
        prompt: result,
      };
    } catch (error) {
      return {
        success: false,
        prompt: template,
        error: error instanceof Error ? error.message : "Unknown error during variable replacement",
      };
    }
  }
}
