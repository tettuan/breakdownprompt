/**
 * Text Validator
 *
 * Purpose:
 * - Validate text content according to rules
 * - Ensure text content is not empty
 * - Check for basic text structure
 */

import type { TextContent } from "../types.ts";
import { ValidationError } from "../errors.ts";

/**
 * A class for validating text content.
 * Provides methods to ensure text content meets basic requirements.
 */
export class TextValidator {
  /**
   * Validates text content according to the rules:
   * - Must not be empty
   * - Must not be only whitespace
   * - Must have at least one line
   * @throws {ValidationError} If the text content is invalid
   */
  validateText(content: string): content is TextContent {
    if (!content) {
      throw new ValidationError("Text content is empty");
    }

    // Trim the content before validation
    const trimmedContent = content.trim();

    // Check for empty content
    if (trimmedContent.length === 0) {
      throw new ValidationError("Text content is empty after trimming");
    }

    // Check for at least one line
    const lines = trimmedContent.split("\n");
    if (lines.length === 0) {
      throw new ValidationError("Text content must have at least one line");
    }

    return true;
  }
}
