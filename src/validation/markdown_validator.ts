/**
 * Text Validator
 *
 * Purpose:
 * - Validate text content according to rules
 * - Ensure text content is not empty
 * - Check for basic text structure
 * - Validate markdown content
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
   * - Must have valid markdown structure if it contains markdown
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

    // Check if content contains any markdown elements
    const hasMarkdownElements = lines.some((line) => {
      // Check for headings
      if (line.match(/^#{1,6}\s/)) return true;
      // Check for lists
      if (line.match(/^[-*+]\s/)) return true;
      // Check for numbered lists
      if (line.match(/^\d+\.\s/)) return true;
      // Check for blockquotes
      if (line.match(/^>\s/)) return true;
      // Check for code blocks
      if (line.match(/^```/)) return true;
      // Check for emphasis
      if (line.match(/[*_]{1,2}[^*_]+[*_]{1,2}/)) return true;
      // Check for links
      if (line.match(/\[([^\]]+)\]\(([^)]+)\)/)) return true;
      return false;
    });

    // Only validate markdown structure if markdown elements are present
    if (hasMarkdownElements) {
      const markdownErrors = this.validateMarkdownContent(content);
      if (markdownErrors.length > 0) {
        throw new ValidationError(`markdown validation failed: ${markdownErrors.join(", ")}`);
      }
    } else {
      // If no markdown elements are present, consider it invalid
      throw new ValidationError("markdown validation failed: no markdown elements found");
    }

    return true;
  }

  /**
   * Validates markdown content
   * @param content - The content to validate
   * @returns Array of error messages, empty if valid
   */
  private validateMarkdownContent(content: string): string[] {
    const errors: string[] = [];
    const lines = content.split("\n");
    let inCodeBlock = false;
    let _inBlockQuote = false;
    let _inList = false;
    let codeBlockStartLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockStartLine = i;
        }
        continue;
      }

      // Skip validation inside code blocks
      if (inCodeBlock) continue;

      // Handle block quotes
      if (line.startsWith(">")) {
        _inBlockQuote = true;
        continue;
      }

      // Handle lists
      if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
        _inList = true;
        continue;
      }

      // Check for unclosed formatting
      const asteriskCount = (line.match(/\*/g) || []).length;
      const underscoreCount = (line.match(/_/g) || []).length;
      const backtickCount = (line.match(/`/g) || []).length;

      if (asteriskCount % 2 !== 0) {
        errors.push(`Unmatched asterisks in line ${i + 1}`);
      }
      if (underscoreCount % 2 !== 0) {
        errors.push(`Unmatched underscores in line ${i + 1}`);
      }
      if (backtickCount % 2 !== 0) {
        errors.push(`Unmatched backticks in line ${i + 1}`);
      }

      // Check for invalid link syntax
      const linkMatches = line.match(/\[([^\]]+)\]\(([^)]+)\)/g);
      if (linkMatches) {
        for (const match of linkMatches) {
          if (!match.match(/\[([^\]]+)\]\(([^)]+)\)/)) {
            errors.push(`Invalid link syntax in line ${i + 1}`);
          }
        }
      }
    }

    // Check for unclosed code blocks
    if (inCodeBlock) {
      errors.push(`Unclosed code block starting at line ${codeBlockStartLine + 1}`);
    }

    return errors;
  }
}
