import { ValidationError } from "../errors.ts";
import type { MarkdownText, VariableReplacer } from "../types.ts";
import { MarkdownValidator } from "../validation/markdown_validator.ts";

/**
 * InputMarkdownReplacer
 *
 * Purpose:
 * - Replace {input_markdown} variables with validated markdown content
 * - Ensure markdown content is valid and properly formatted
 * - Prevent empty or invalid markdown content
 */
export class InputMarkdownReplacer implements VariableReplacer {
  private markdownValidator: MarkdownValidator;

  constructor() {
    this.markdownValidator = new MarkdownValidator();
  }

  /**
   * Validates markdown content according to the rules:
   * - Must not be empty
   * - Must not be only whitespace
   * - Must have some content
   */
  validate(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }

    return this.markdownValidator.validateMarkdown(value);
  }

  /**
   * Replaces an input markdown variable with its value
   * - Validates the content
   * - Returns the validated markdown
   */
  replace(value: unknown): string {
    if (typeof value !== "string") {
      throw new ValidationError("Input markdown must be a string");
    }

    if (!this.validate(value)) {
      throw new ValidationError("Invalid markdown content");
    }

    // Cast to MarkdownText type after validation
    const markdownText = value as MarkdownText;
    return markdownText;
  }
}
