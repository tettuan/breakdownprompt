/**
 * Prompt Manager
 *
 * Purpose:
 * - Manage prompt generation and variable replacement
 * - Handle template loading and validation
 * - Support optional variables
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { TemplateError, ValidationError } from "../errors.ts";
import type { PromptGenerationResult } from "../types/prompt_result.ts";
import type { TextContent } from "../types.ts";
import { FileUtils } from "../utils/file_utils.ts";
import { TextValidator } from "../validation/markdown_validator.ts";
import { PathValidator } from "../validation/path_validator.ts";
import { VariableValidator } from "../validation/variable_validator.ts";
import type { PromptReader as _PromptReader } from "./prompt_reader.ts";
import { VariableResolver } from "./variable_resolver.ts";
import type { PromptParams } from "../types/prompt_params.ts";
import { PermissionErrorMessages } from "../errors/permission_errors.ts";

/**
 * A class for managing and generating prompts from templates with variable replacement.
 *
 * @class PromptManager
 * @description
 * This class provides functionality for:
 * - Loading prompt templates from files
 * - Validating template paths and variables
 * - Replacing variables in templates
 * - Generating final prompts
 *
 * It handles various aspects of prompt generation including:
 * - File system operations
 * - Path validation
 * - Variable validation and replacement
 * - Error handling
 *
 * @property {TextValidator} textValidator - Validator for text content
 * @property {PathValidator} pathValidator - Validator for file paths
 * @property {VariableValidator} variableValidator - Validator for variables
 * @property {FileUtils} fileUtils - Utility for file operations
 * @property {BreakdownLogger} logger - Logger for debugging
 *
 * @example
 * ```typescript
 * const manager = new PromptManager();
 * const result = await manager.generatePrompt(
 *   "./templates/task.md",
 *   { name: "John", task: "Code Review" }
 * );
 * ```
 */
export class PromptManager {
  private textValidator: TextValidator;
  private pathValidator: PathValidator;
  private variableValidator: VariableValidator;
  private fileUtils: FileUtils;
  private logger: BreakdownLogger;

  /**
   * Creates a new PromptManager instance.
   * @param textValidator - Validator for text content
   * @param pathValidator - Validator for file paths
   * @param variableValidator - Validator for variables
   * @param fileUtils - Utility for file operations
   * @param logger - Logger for debugging
   */
  constructor(
    textValidator: TextValidator = new TextValidator(),
    pathValidator: PathValidator = new PathValidator(),
    variableValidator: VariableValidator = new VariableValidator(),
    fileUtils: FileUtils = new FileUtils(),
    logger: BreakdownLogger = new BreakdownLogger(),
  ) {
    this.textValidator = textValidator;
    this.pathValidator = pathValidator;
    this.variableValidator = variableValidator;
    this.fileUtils = fileUtils;
    this.logger = logger;
  }

  /**
   * Generates a prompt by replacing variables in a template.
   * @param templatePathOrContent - Path to the template file or the template content itself
   * @param variables - A record of variable names and their replacement values
   * @returns A promise that resolves to the generated prompt
   * @throws {ValidationError} If template or variables are invalid
   * @throws {FileSystemError} If the template file cannot be read
   * @throws {TemplateError} If there are circular references in variables
   */
  public async generatePrompt(
    templatePathOrContent: string,
    variables: Record<string, string>,
  ): Promise<PromptGenerationResult> {
    try {
      let templateContent: string;

      // If the input looks like a file path, try to load it
      if (
        templatePathOrContent.includes("/") ||
        (templatePathOrContent.includes(".") && templatePathOrContent.includes("/"))
      ) {
        // Validate template path using PathValidator
        try {
          await this.pathValidator.validateFilePath(templatePathOrContent);
        } catch (error) {
          if (error instanceof ValidationError) {
            return { success: false, error: error.message };
          }
          throw error;
        }

        // Load template content
        try {
          templateContent = await this.loadTemplate(templatePathOrContent);
          if (!templateContent) {
            return { success: false, error: `Template not found: ${templatePathOrContent}` };
          }
        } catch (error) {
          if (error instanceof Deno.errors.PermissionDenied) {
            return {
              success: false,
              error:
                `${PermissionErrorMessages.READ_TEMPLATE}: Cannot read template file at ${templatePathOrContent}`,
            };
          }
          if (error instanceof Deno.errors.NotFound) {
            return { success: false, error: `Template not found: ${templatePathOrContent}` };
          }
          throw error;
        }
      } else {
        // Use the input directly as template content
        templateContent = templatePathOrContent;
      }

      // Check for empty template
      if (!templateContent || templateContent.trim() === "") {
        return { success: false, error: "Template is empty" };
      }

      // Replace variables in template
      let prompt = templateContent as TextContent;

      // Extract variables from template
      const templateVars = this.extractTemplateVariables(templateContent);

      // Then validate variable names and values
      try {
        // First validate all variable names
        for (const [_key] of Object.entries(variables)) {
          try {
            this.variableValidator.validateKey(_key);
          } catch (error) {
            if (error instanceof ValidationError) {
              return {
                success: false,
                error: error.message,
              };
            }
            throw error;
          }
        }

        // Then validate all variables and their values
        try {
          // Skip reserved variable validation for prompt variables
          // this.variableValidator.validateVariables(variables);
          // Instead, just validate that the values are strings
          for (const [_key, value] of Object.entries(variables)) {
            if (
              value !== undefined && value !== null && value !== "" && typeof value !== "string"
            ) {
              throw new ValidationError(`Invalid type for variable: ${_key}`);
            }
          }
        } catch (error) {
          if (error instanceof ValidationError) {
            return {
              success: false,
              error: error.message,
            };
          }
          if (error instanceof TemplateError) {
            return {
              success: false,
              error: error.message,
            };
          }
          throw error;
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          return {
            success: false,
            error: error.message,
          };
        }
        if (error instanceof TemplateError) {
          return {
            success: false,
            error: error.message,
          };
        }
        throw error;
      }

      // Replace variables in template
      const varRegex = /\{([^}]+)\}/g;
      let match;
      const matches = [];

      // Collect all matches first
      while ((match = varRegex.exec(templateContent)) !== null) {
        const varName = match[1].trim();
        // Skip conditional blocks
        if (varName.startsWith("#if ") || varName === "/if") {
          continue;
        }
        matches.push({ varName, fullMatch: match[0] });
      }

      try {
        // Process matches in reverse order to handle nested references correctly
        for (const { varName, fullMatch } of matches.reverse()) {
          this.logger.debug("Processing variable", { varName, fullMatch });
          // If the variable exists in our variables object and has a value, use it
          if (
            varName in variables && variables[varName] !== undefined &&
            variables[varName] !== null &&
            variables[varName].trim() !== ""
          ) {
            const value = variables[varName];
            this.logger.debug("Replacing variable", { varName, value });
            prompt = prompt.replace(
              new RegExp(fullMatch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
              value,
            ) as TextContent;
          } else {
            this.logger.debug("Skipping variable (not found or empty)", { varName });
          }
          // Leave unknown variables in the template
        }
      } catch (error) {
        if (error instanceof TemplateError) {
          return {
            success: false,
            error: error.message,
          };
        }
        throw error;
      }

      // Return the result with success
      return {
        success: true,
        prompt,
        variables: templateVars,
        unknownVariables: templateVars.filter((v) =>
          !(v in variables) || variables[v] === undefined || variables[v] === null ||
          variables[v].trim() === ""
        ),
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
        };
      }
      if (error instanceof TemplateError) {
        return {
          success: false,
          error: error.message,
        };
      }
      throw error;
    }
  }

  /**
   * Extracts variables from a template.
   * @param templateContent - The template content to extract variables from
   * @returns An array of variable names
   */
  private extractTemplateVariables(templateContent: string): string[] {
    if (!templateContent) {
      return [];
    }

    const varRegex = /\{([^}]+)\}/g;
    const variables = new Set<string>();
    let match;

    while ((match = varRegex.exec(templateContent)) !== null) {
      const varName = match[1].trim();
      // Skip conditional blocks
      if (varName.startsWith("#if ") || varName === "/if") {
        continue;
      }
      variables.add(varName);
    }

    return Array.from(variables);
  }

  /**
   * Validates prompt generation parameters.
   * @param params - The parameters to validate
   * @throws {ValidationError} If parameters are invalid
   */
  private validateParams(params: PromptParams): void {
    if (!params) {
      throw new ValidationError("Prompt parameters are required");
    }

    if (!params.template_file) {
      throw new ValidationError("Template file is required");
    }

    if (!params.variables) {
      throw new ValidationError("Variables are required");
    }
  }

  /**
   * Loads a template from a file.
   * @param templatePath - Path to the template file
   * @returns The template content
   * @throws {FileSystemError} If the template file cannot be read
   */
  private async loadTemplate(templatePath: string): Promise<string> {
    try {
      const content = await this.fileUtils.readFile(templatePath);
      return content;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`Template not found: ${templatePath}`);
      }
      throw error;
    }
  }

  /**
   * Replaces variables in a template.
   * @param template - The template content
   * @param variables - The variables to replace
   * @returns The template with variables replaced
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    const varRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = varRegex.exec(template)) !== null) {
      const varName = match[1].trim();
      // Skip conditional blocks
      if (varName.startsWith("#if ") || varName === "/if") {
        continue;
      }
      // If the variable exists in our variables object and has a value, use it
      if (
        varName in variables && variables[varName] !== undefined && variables[varName] !== null &&
        variables[varName].trim() !== ""
      ) {
        const value = variables[varName];
        result = result.replace(`{${varName}}`, value);
      }
    }

    return result;
  }

  /**
   * Writes a prompt to a file.
   * @param content - The prompt content to write
   * @param destinationPath - Path to write the prompt to
   * @throws {FileSystemError} If the prompt cannot be written
   */
  async writePrompt(content: string, destinationPath: string): Promise<void> {
    try {
      await this.fileUtils.writeFile(destinationPath, content);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`Cannot write to file: ${destinationPath}`);
      }
      throw error;
    }
  }

  /**
   * Validates text content.
   * @param text - The text to validate
   * @throws {ValidationError} If the text is invalid
   */
  private validateText(text: string): void {
    if (!text || text.trim() === "") {
      throw new ValidationError("Text content is empty");
    }
  }

  /**
   * Processes a template with variables.
   * @param templatePath - Path to the template file
   * @param variables - Variables to replace in the template
   * @returns The processed template content
   */
  async processTemplate(
    templatePath: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const templateContent = await this.loadTemplate(templatePath);
    const variableResolver = new VariableResolver(variables);
    return variableResolver.resolveVariable(templateContent);
  }
}
