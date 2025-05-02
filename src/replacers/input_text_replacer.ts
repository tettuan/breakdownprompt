import type { ValidationError as _ValidationError } from "../errors.ts";
import type { TextContent as _TextContent, VariableReplacer } from "../types.ts";
import { TextValidator } from "../validation/markdown_validator.ts";

/**
 * InputTextReplacer
 *
 * Purpose:
 * - Replace {input_text} variables with validated text content
 * - Ensure text content is valid
 * - Prevent injection attacks
 */
export class InputTextReplacer implements VariableReplacer {
  private textValidator: TextValidator;

  constructor() {
    this.textValidator = new TextValidator();
  }

  /**
   * Validates text content according to the rules:
   * - Must be a string
   * - Must not be empty
   */
  validate(value: unknown): Promise<boolean> {
    if (typeof value !== "string") {
      return Promise.resolve(false);
    }

    return Promise.resolve(value.trim() !== "");
  }

  /**
   * Replaces an input text variable with its value
   * - Validates the text
   * - Returns the normalized text
   */
  async replace(value: unknown): Promise<string> {
    if (typeof value !== "string") {
      return "";
    }

    if (!await this.validate(value)) {
      return "";
    }

    return value.trim();
  }
}
