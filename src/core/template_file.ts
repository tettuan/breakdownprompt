/**
 * Template File
 *
 * Purpose:
 * - Handles template file operations
 * - Validates file extensions (.md, .txt, .yml)
 * - Reads template content
 * - Extracts variables from templates
 *
 * Note:
 * - Uses FileUtils for file operations
 * - Uses BreakdownLogger for debugging (only in tests)
 */

import type { FileUtils } from "../utils/file_utils.ts";
import type { BreakdownLogger } from "@tettuan/breakdownlogger";

export class TemplateFile {
  private readonly fileUtils: FileUtils;
  private readonly logger: BreakdownLogger;

  constructor(fileUtils: FileUtils, logger: BreakdownLogger) {
    this.fileUtils = fileUtils;
    this.logger = logger;
  }

  /**
   * Validates the template file extension
   * @param filePath Path to the template file
   * @returns true if valid, false otherwise
   */
  validate(filePath: string): boolean {
    const validExtensions = [".md", ".txt", ".yml"];
    const extension = filePath.substring(filePath.lastIndexOf("."));
    return validExtensions.includes(extension);
  }

  /**
   * Reads the template file content
   * @param filePath Path to the template file
   * @returns Template content
   * @throws Error if file cannot be read
   */
  async read(filePath: string): Promise<string> {
    try {
      const content = await this.fileUtils.readFile(filePath);
      return content;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error("Failed to read template file", { error: errorMessage });
      throw new Error(`Failed to read template file: ${errorMessage}`);
    }
  }

  /**
   * Extracts variables from template content
   * @param content Template content
   * @returns Array of variable names
   */
  extractVariables(content: string): string[] {
    // First, remove all double curly braces
    const doubleBracePattern = /\{\{[^{}]*\}\}/g;
    let processedContent = content.replace(doubleBracePattern, " ");

    // Then find malformed variables (spaces between braces or unclosed braces)
    const malformedPattern = /\{[^{}]*\s+[^{}]*\}/g;
    let match;
    while ((match = malformedPattern.exec(processedContent)) !== null) {
      this.logger.warn("Found malformed template variable", { variable: match[0] });
    }

    // Remove all malformed variables from the content
    processedContent = processedContent.replace(malformedPattern, " ");

    // Find unclosed braces
    const unclosedPattern = /\{[^{}]*$/g;
    while ((match = unclosedPattern.exec(processedContent)) !== null) {
      this.logger.warn("Found malformed template variable", { variable: match[0] });
    }

    // Remove unclosed braces
    processedContent = processedContent.replace(unclosedPattern, " ");

    // Find variables with double curly braces
    const doubleOpenPattern = /\{\{[^{}]*\}/g;
    while ((match = doubleOpenPattern.exec(processedContent)) !== null) {
      this.logger.warn("Found malformed template variable", { variable: match[0] });
    }

    // Remove variables with double curly braces
    processedContent = processedContent.replace(doubleOpenPattern, " ");

    // Extract variables from single curly braces with no spaces
    const variablePattern = /\{([^{}\s]+)\}/g;
    const variables = new Set<string>();
    let variableMatch;

    while ((variableMatch = variablePattern.exec(processedContent)) !== null) {
      const variable = variableMatch[1].trim();
      if (variable) {
        variables.add(variable);
      }
    }

    const result = Array.from(variables);
    this.logger.debug("Extracted variables", { variables: result });
    return result;
  }
}
