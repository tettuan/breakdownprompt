/**
 * Markdown Validator
 *
 * Purpose:
 * - Validate markdown content according to rules
 * - Ensure markdown content is not empty
 * - Check for basic markdown structure
 */

export class MarkdownValidator {
  /**
   * Validates markdown content according to the rules:
   * - Must not be empty
   * - Must not be only whitespace
   * - Must have at least one heading
   */
  validateMarkdown(content: string): boolean {
    if (!content) return false;

    // Trim the content before validation
    const trimmedContent = content.trim();

    // Check for empty content
    if (trimmedContent.length === 0) return false;

    // Check for at least one heading (# followed by space)
    const headingRegex = /^#+\s+\w+/m;
    if (!headingRegex.test(trimmedContent)) return false;

    return true;
  }
}
