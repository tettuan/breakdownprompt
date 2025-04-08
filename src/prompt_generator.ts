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

interface Section {
  title: string;
  content: string;
  level: number;
  children: Section[];
}

export class PromptGenerator {
  validateTemplate(template: string): void {
    if (!template || template.trim() === '') {
      throw new TemplateError('Template is empty');
    }

    const sections = this.parseSections(template);
    this.validateSectionStructure(sections);
  }

  validateSectionStructure(sections: Section[]): void {
    const currentLevel = 1;
    let lastSectionLevel = 0;

    const validateSection = (section: Section, parentLevel = 0, isFirstChild = true): void => {
      const hasContent = section.content.trim() !== "" ||
        section.children.some((child) => child.content.trim() !== "");

      if (!hasContent) {
        throw new ValidationError(`Empty section: ${section.title}`);
      }

      if (section.level !== parentLevel + 1) {
        throw new ValidationError("Invalid section structure");
      }

      if (!isFirstChild && section.level !== lastSectionLevel) {
        throw new ValidationError("Invalid section structure");
      }

      lastSectionLevel = section.level;

      let isFirst = true;
      for (const child of section.children) {
        validateSection(child, section.level, isFirst);
        isFirst = false;
      }
    };

    let isFirst = true;
    for (const section of sections) {
      if (section.level !== 1) {
        throw new ValidationError("Invalid section structure");
      }
      validateSection(section, 0, isFirst);
      isFirst = false;
    }
  }

  isValidVariableName(name: string): boolean {
    // Allow letters, numbers, underscores, hyphens, dots, spaces, and brackets
    return /^[a-zA-Z][a-zA-Z0-9_\-.\s\[\]]*$/.test(name);
  }

  validateVariableValue(name: string, value: unknown): void {
    if (value === null || value === undefined || typeof value !== 'string' || value.trim() === '') {
      throw new ValidationError(`Invalid value for variable: ${name}`);
    }
  }

  validateVariableName(name: string): void {
    if (!this.isValidVariableName(name)) {
      throw new ValidationError(`Invalid variable name: ${name}`);
    }
  }

  validateVariables(variables: Record<string, unknown>): void {
    for (const name of Object.keys(variables)) {
      this.validateVariableName(name);
    }
    for (const [name, value] of Object.entries(variables)) {
      this.validateVariableValue(name, value);
    }
  }

  parseSections(template: string): Section[] {
    const lines = template.split("\n");
    const rootSections: Section[] = [];
    let currentSection: Section | null = null;
    let sectionStack: Section[] = [];
    let lastLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const sectionMatch = line.match(/^(#+)\s+(.+)$/);

      if (sectionMatch) {
        const level = sectionMatch[1].length;
        const title = sectionMatch[2];

        if (level > lastLevel + 1) {
          throw new ValidationError("Invalid section structure");
        }

        if (level === 1) {
          sectionStack = [];
          lastLevel = 0;
        }

        if (level > 1 && sectionStack.length === 0) {
          throw new ValidationError("Invalid section structure");
        }

        const newSection: Section = {
          title,
          content: "",
          level,
          children: [],
        };

        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
          sectionStack.pop();
        }

        if (sectionStack.length === 0) {
          rootSections.push(newSection);
        } else {
          const parent = sectionStack[sectionStack.length - 1];
          parent.children.push(newSection);
        }

        sectionStack.push(newSection);
        currentSection = newSection;
        lastLevel = level;
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    this.validateSectionStructure(rootSections);

    return rootSections;
  }

  parseTemplate(template: string, variables: Record<string, unknown>): PromptResult {
    if (!template || template.trim() === "") {
      throw new TemplateError("Template is empty");
    }

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

  private escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
