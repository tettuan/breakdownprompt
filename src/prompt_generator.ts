/**
 * PromptGenerator
 *
 * Purpose:
 * - Parse and process prompt templates
 * - Handle variable replacement
 * - Validate input values
 * - Generate formatted output
 *
 * Background:
 * The PromptGenerator is responsible for parsing prompt templates and replacing
 * variables with their corresponding values. It supports multiple variable types
 * and ensures proper validation and error handling.
 */

import { TemplateError, ValidationError } from "./errors.ts";
import type { PromptResult } from "./types.ts";

/** Represents a section in a markdown template with its title, content, and heading level */
interface Section {
  title: string;
  content: string;
  level: number;
}

/**
 * A class that generates prompts from templates by replacing variables with their values.
 * It handles validation, parsing, and formatting of the output.
 */
export class PromptGenerator {
  /**
   * Validates that a template is not empty and has valid structure
   * @param template - The template string to validate
   * @throws {TemplateError} If the template is empty
   */
  validateTemplate(template: string): void {
    if (!template || template.trim() === "") {
      throw new TemplateError("Template is empty");
    }

    const sections = this.parseSections(template);
    this.validateSectionStructure(sections);
  }

  /**
   * Validates that each section in the template has non-empty content
   * @param sections - Array of sections to validate
   * @throws {ValidationError} If any section has empty content
   */
  validateSectionStructure(sections: Section[]): void {
    for (const section of sections) {
      const hasContent = section.content.trim() !== "";
      if (!hasContent) {
        throw new ValidationError(`Empty section: ${section.title}`);
      }
    }
  }

  /**
   * Checks if a variable name follows the allowed format
   * @param name - The variable name to validate
   * @returns true if the name is valid, false otherwise
   */
  isValidVariableName(name: string): boolean {
    // Allow letters, numbers, underscores, hyphens, dots, spaces, and brackets
    return /^[a-zA-Z][a-zA-Z0-9_\-.\s\[\]]*$/.test(name);
  }

  /**
   * Validates that a variable value is not null, undefined, or empty
   * @param name - The name of the variable being validated
   * @param value - The value to validate
   * @throws {ValidationError} If the value is invalid
   */
  validateVariableValue(name: string, value: unknown): void {
    if (value === null || value === undefined || typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`Invalid value for variable: ${name}`);
    }
  }

  /**
   * Validates that a variable name is not empty and follows the allowed format
   * @param name - The variable name to validate
   * @throws {ValidationError} If the name is invalid
   */
  validateVariableName(name: string): void {
    if (!this.isValidVariableName(name)) {
      throw new ValidationError(`Invalid variable name: ${name}`);
    }
  }

  /**
   * Validates all variables in a record
   * @param variables - The variables to validate
   * @throws {ValidationError} If any variable is invalid
   */
  validateVariables(variables: Record<string, unknown>): void {
    for (const name of Object.keys(variables)) {
      this.validateVariableName(name);
    }
    for (const [name, value] of Object.entries(variables)) {
      this.validateVariableValue(name, value);
    }
  }

  /**
   * Parses a template into sections based on markdown headers
   * @param template - The template string to parse
   * @returns Array of sections with their titles, content, and heading levels
   */
  parseSections(template: string): Section[] {
    const lines = template.split("\n");
    const sections: Section[] = [];
    let currentSection: Section | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const sectionMatch = line.match(/^(#+)\s+(.+)$/);

      if (sectionMatch) {
        const level = sectionMatch[1].length;
        const title = sectionMatch[2];

        if (level > 1) {
          throw new ValidationError("Invalid section structure");
        }

        const newSection: Section = {
          title,
          content: "",
          level,
        };

        sections.push(newSection);
        currentSection = newSection;
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    this.validateSectionStructure(sections);

    return sections;
  }

  /**
   * Parses a template and replaces variables with their values
   * @param template - The template string to parse
   * @param variables - The variables to replace in the template
   * @returns The parsed and processed prompt result
   */
  parseTemplate(template: string, variables: Record<string, unknown>): PromptResult {
    if (!template || template.trim() === "") {
      throw new TemplateError("Template is empty");
    }

    // Validate sections first
    const sections = this.parseSections(template);
    this.validateSectionStructure(sections);

    const variablePattern = /{([^}]+)}/g;
    const matches = template.matchAll(variablePattern);
    const variableNames = [...new Set([...matches].map((match) => match[1]))];

    for (const name of variableNames) {
      if (!this.isValidVariableName(name)) {
        throw new ValidationError(`Invalid variable name: ${name}`);
      }
    }

    const missingVariables = variableNames.filter((name) => !(name in variables));
    if (missingVariables.length > 0) {
      throw new ValidationError(`Missing required variable: ${missingVariables[0]}`);
    }

    for (const name of variableNames) {
      this.validateVariableValue(name, variables[name]);
    }

    let content = template;
    for (const name of variableNames) {
      const value = variables[name] as string;
      const escapedName = this.escapeRegExp(name);
      content = content.replace(new RegExp(`{${escapedName}}`, "g"), value);
    }

    return {
      content,
      variables: variableNames,
      unknownVariables: [],
    };
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
