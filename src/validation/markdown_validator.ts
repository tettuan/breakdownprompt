/**
 * Text Validator
 *
 * Purpose:
 * - Validate text content according to rules
 * - Allow empty text content
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
   * - Empty text is allowed
   * - Must be a string
   * @throws {ValidationError} If the text content is invalid
   */
  validateText(content: string): content is TextContent {
    if (content === undefined || content === null) {
      throw new ValidationError("Text content is undefined or null");
    }

    if (typeof content !== "string") {
      throw new ValidationError("Text content must be a string");
    }

    return true;
  }
}
