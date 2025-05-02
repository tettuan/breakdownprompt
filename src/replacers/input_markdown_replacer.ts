import { ValidationError } from "../errors.ts";
import type { TextContent as _TextContent, VariableReplacer } from "../types.ts";
import { TextValidator } from "../validation/markdown_validator.ts";

/**
 * InputMarkdownReplacer
 *
 * Purpose:
 * - Replace {input_markdown} variables with validated markdown content
 * - Ensure markdown content is valid and properly formatted
 * - Prevent empty or invalid markdown content
 */
export class InputMarkdownReplacer implements VariableReplacer {
  private textValidator: TextValidator;

  constructor() {
    this.textValidator = new TextValidator();
  }

  /**
   * Validates that a value is valid text content
   * @param value - The value to validate
   * @returns true if the value is valid text content
   */
  validate(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }

    try {
      return this.textValidator.validateText(value);
    } catch {
      return false;
    }
  }

  /**
   * Replaces a variable with its text content value
   * @param value - The value to replace with
   * @returns The processed text content
   * @throws {ValidationError} If the value is invalid
   */
  replace(value: unknown): string {
    if (!this.validate(value)) {
      throw new ValidationError("Invalid text content");
    }

    return value as string;
  }
}
