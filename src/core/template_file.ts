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
    // Match variables between {{ and }}, ignoring malformed templates
    const variablePattern = /\{\{([^{}]+)\}\}/g;
    const malformedPattern = /\{\{([^{}]+)(?!\}\})/g;
    const variables = new Set<string>();
    let match;

    // Check for malformed templates and log them
    let malformedMatch;
    while ((malformedMatch = malformedPattern.exec(content)) !== null) {
      this.logger.warn("Found malformed template variable", { variable: malformedMatch[0] });
    }

    // Extract only properly formed variables
    while ((match = variablePattern.exec(content)) !== null) {
      if (match[1]) {
        variables.add(match[1].trim());
      }
    }

    return Array.from(variables);
  }
}
