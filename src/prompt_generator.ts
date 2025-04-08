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
import { BreakdownLogger } from "@tettuan/breakdownlogger";

interface Section {
  title: string;
  content: string;
  level: number;
  children: Section[];
}

export class PromptGenerator {
  private logger: BreakdownLogger;

  constructor() {
    this.logger = new BreakdownLogger();
  }

  validateTemplate(template: string): void {
    this.logger.debug("Validating template", { template });

    if (!template || template.trim() === "") {
      this.logger.debug("Template is empty");
      throw new ValidationError("Template cannot be empty");
    }

    // Parse and validate section structure
    this.logger.debug("Parsing sections");
    const sections = this.parseSections(template);
    this.logger.debug("Sections parsed", { sections });

    this.logger.debug("Validating section structure");
    this.validateSectionStructure(sections);
    this.logger.debug("Section structure validated");
  }

  validateSectionStructure(sections: Section[]): void {
    const currentLevel = 1;
    let lastSectionLevel = 0;

    const validateSection = (section: Section, parentLevel = 0, isFirstChild = true): void => {
      this.logger.debug("Validating section", {
        title: section.title,
        level: section.level,
        parentLevel,
        currentLevel,
        lastSectionLevel,
        isFirstChild,
        hasContent: section.content.trim() !== "",
        childrenCount: section.children.length,
      });

      // Check if this section or any of its children have content
      const hasContent = section.content.trim() !== "" ||
        section.children.some((child) => child.content.trim() !== "");

      if (!hasContent) {
        this.logger.debug("Empty section found", { title: section.title });
        throw new ValidationError(`Empty section: ${section.title}`);
      }

      // Check for invalid section nesting
      if (section.level !== parentLevel + 1) {
        this.logger.debug("Invalid section nesting", {
          title: section.title,
          level: section.level,
          parentLevel,
        });
        throw new ValidationError("Invalid section structure");
      }

      // Check for invalid level transitions
      if (!isFirstChild && section.level !== lastSectionLevel) {
        this.logger.debug("Invalid level transition", {
          title: section.title,
          level: section.level,
          lastSectionLevel,
        });
        throw new ValidationError("Invalid section structure");
      }

      lastSectionLevel = section.level;

      // Validate children's levels
      let isFirst = true;
      for (const child of section.children) {
        validateSection(child, section.level, isFirst);
        isFirst = false;
      }
    };

    // For root sections, they should be level 1
    let isFirst = true;
    for (const section of sections) {
      if (section.level !== 1) {
        this.logger.debug("Invalid root section level", {
          title: section.title,
          level: section.level,
        });
        throw new ValidationError("Invalid section structure");
      }
      validateSection(section, 0, isFirst);
      isFirst = false;
    }
  }

  isValidVariableName(name: string): boolean {
    if (!name) return false;
    // Allow letters, numbers, underscores, hyphens, dots, brackets, and spaces in variable names
    // Must start with a letter
    return /^[a-zA-Z][\w\-\.\[\] ]*$/.test(name);
  }

  validateVariableValue(name: string, value: unknown): void {
    if (value === null || value === undefined || typeof value !== "string" || value.trim() === "") {
      throw new ValidationError(`Invalid value for variable: ${name}`);
    }
  }

  parseSections(template: string): Section[] {
    this.logger.debug("Starting to parse sections", { template });

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

        this.logger.debug("Found section", {
          title,
          level,
          lastLevel,
          stackSize: sectionStack.length,
          stackLevels: sectionStack.map((s) => s.level),
        });

        // Check for invalid section nesting
        if (level > lastLevel + 1) {
          this.logger.debug("Invalid section nesting during parsing", {
            title,
            level,
            lastLevel,
          });
          throw new ValidationError("Invalid section structure");
        }

        // If we're at level 1, we should clear the stack
        if (level === 1) {
          this.logger.debug("Clearing stack for level 1 section", { title });
          sectionStack = [];
          lastLevel = 0;
        }

        // If we have a subsection but no parent, it's invalid
        if (level > 1 && sectionStack.length === 0) {
          this.logger.debug("Subsection without parent", {
            title,
            level,
            stackSize: sectionStack.length,
          });
          throw new ValidationError("Invalid section structure");
        }

        const newSection: Section = {
          title,
          content: "",
          level,
          children: [],
        };

        // Pop sections from stack until we find the parent or root
        while (sectionStack.length > 0 && sectionStack[sectionStack.length - 1].level >= level) {
          const popped = sectionStack.pop();
          this.logger.debug("Popped section from stack", {
            title: popped?.title,
            level: popped?.level,
          });
        }

        if (sectionStack.length === 0) {
          // This is a root section
          this.logger.debug("Adding root section", { title, level });
          rootSections.push(newSection);
        } else {
          // Add as child to the current parent
          const parent = sectionStack[sectionStack.length - 1];
          this.logger.debug("Adding child section", {
            title,
            level,
            parentTitle: parent.title,
            parentLevel: parent.level,
          });
          parent.children.push(newSection);
        }

        sectionStack.push(newSection);
        currentSection = newSection;
        lastLevel = level;
      } else if (currentSection) {
        currentSection.content += line + "\n";
      }
    }

    this.logger.debug("Finished parsing sections", {
      rootSectionsCount: rootSections.length,
      rootSections: rootSections.map((s) => ({
        title: s.title,
        level: s.level,
        childrenCount: s.children.length,
      })),
    });

    // Validate the section structure
    this.validateSectionStructure(rootSections);

    return rootSections;
  }

  parseTemplate(template: string, variables: Record<string, unknown>): PromptResult {
    // Validate template
    if (!template || template.trim() === "") {
      throw new ValidationError("Template cannot be empty");
    }

    // Extract variables from template
    const variableRegex = /{([^}]+)}/g;
    const matches = [...template.matchAll(variableRegex)];
    const templateVariables = matches.map((match) => match[1]);

    // Validate variable names and values
    for (const [name, value] of Object.entries(variables)) {
      if (!this.isValidVariableName(name)) {
        throw new ValidationError(`Invalid variable name: ${name}`);
      }
      this.validateVariableValue(name, value);
    }

    // Replace variables
    let result = template;
    for (const variable of templateVariables) {
      if (variables[variable] === undefined) {
        throw new ValidationError(`Missing required variable: ${variable}`);
      }
      result = result.replace(new RegExp(`{${variable}}`, "g"), variables[variable] as string);
    }

    return {
      content: result,
      variables: templateVariables,
      unknownVariables: [],
    };
  }
}
