import type { ValidationError as _ValidationError } from "../errors.ts";

export interface VariableReplacerOptions {
  variables: Record<string, string>;
}

export interface VariableReplacerResult {
  success: boolean;
  prompt: string;
  error?: string;
}

export class VariableReplacer {
  private variables: Record<string, string>;

  constructor(options: VariableReplacerOptions) {
    this.variables = options.variables;
  }

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
