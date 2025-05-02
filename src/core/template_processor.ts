/**
 * Template Processor
 *
 * Purpose:
 * - Process templates with variable replacement
 * - Validate variable types and values
 * - Handle template parsing and error handling
 *
 * Background:
 * The TemplateProcessor is responsible for processing templates and replacing
 * variables with their corresponding values. It supports multiple variable types
 * and ensures proper validation and error handling.
 */

import { TemplateError, ValidationError } from "../errors.ts";
import type {
  DirectoryPath,
  FilePath,
  TextContent,
  ValidVariableKey,
  Variables,
} from "../types.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

export class TemplateProcessor {
  private logger: BreakdownLogger;

  constructor() {
    this.logger = new BreakdownLogger();
  }

  /**
   * Validates a file path
   * @param path - The path to validate
   * @returns true if valid, throws ValidationError if invalid
   */
  validateFilePath(path: FilePath): boolean {
    this.logger.debug("Validating file path", { path });

    if (!path || typeof path !== "string") {
      throw new ValidationError("Invalid file path");
    }

    const validExtensions = [".md", ".txt", ".yml"];
    const hasValidExtension = validExtensions.some((ext) => path.endsWith(ext));

    if (!hasValidExtension) {
      throw new ValidationError("Invalid file extension");
    }

    return true;
  }

  /**
   * Validates a directory path
   * @param path - The path to validate
   * @returns true if valid, throws ValidationError if invalid
   */
  validateDirectoryPath(path: DirectoryPath): boolean {
    this.logger.debug("Validating directory path", { path });

    if (!path || typeof path !== "string") {
      throw new ValidationError("Invalid directory path");
    }

    if (!path.endsWith("/")) {
      throw new ValidationError("Invalid directory path");
    }

    return true;
  }

  /**
   * Validates text content
   * @param content - The content to validate
   * @returns true if valid, throws ValidationError if invalid
   */
  validateTextContent(content: TextContent): boolean {
    this.logger.debug("Validating text content", { content });

    if (!content || typeof content !== "string" || content.trim() === "") {
      throw new ValidationError("Text content cannot be empty");
    }

    return true;
  }

  /**
   * Validates a variable key
   * @param key - The key to validate
   * @returns true if valid, throws ValidationError if invalid
   */
  validateVariableKey(key: string): key is ValidVariableKey {
    this.logger.debug("Validating variable key", { key });

    if (!key || typeof key !== "string") {
      throw new ValidationError("Invalid variable key");
    }

    const isValid = /^[a-zA-Z][a-zA-Z0-9_]*$/.test(key);
    if (!isValid) {
      throw new ValidationError(`Invalid variable name: ${key}`);
    }

    return true;
  }

  /**
   * Processes a template with variable replacement
   * @param template - The template string
   * @param variables - The variables to replace
   * @returns The processed template
   */
  processTemplate(template: string, variables: Variables): string {
    this.logger.debug("Processing template", { template, variables });

    if (!template || template.trim() === "") {
      throw new TemplateError("Template is empty");
    }

    // Validate all variable keys
    for (const key of Object.keys(variables)) {
      this.validateVariableKey(key);
    }

    // Validate all variable values
    for (const [key, value] of Object.entries(variables)) {
      if (value === null || value === undefined) {
        throw new ValidationError(`Invalid value for variable: ${key}`);
      }

      if (typeof value === "string") {
        if (key.endsWith("_path")) {
          if (value.endsWith("/")) {
            this.validateDirectoryPath(value as DirectoryPath);
          } else {
            this.validateFilePath(value as FilePath);
          }
        } else {
          this.validateTextContent(value as TextContent);
        }
      }
    }

    // Replace variables in template
    let result = template;
    const variablePattern = /{([^}]+)}/g;
    const matches = template.matchAll(variablePattern);
    const variableNames = [...new Set([...matches].map((match) => match[1]))];

    // Check for missing variables
    const missingVariables = variableNames.filter((name) => !(name in variables));
    if (missingVariables.length > 0) {
      throw new ValidationError(`Missing required variable: ${missingVariables[0]}`);
    }

    // Replace variables
    for (const name of variableNames) {
      const value = variables[name as ValidVariableKey];
      if (value === null || value === undefined) {
        throw new ValidationError(`Invalid value for variable: ${name}`);
      }
      result = result.replace(new RegExp(`{${this.escapeRegExp(name)}}`, "g"), value.toString());
    }

    return result;
  }

  /**
   * Escapes special characters in a string for use in a regular expression
   * @param str - The string to escape
   * @returns The escaped string
   */
  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
