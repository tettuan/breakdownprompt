import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { FileSystemError, TemplateError, ValidationError } from "../errors.ts";
import type { PromptGenerationResult } from "../types/prompt_result.ts";
import type { TextContent } from "../types.ts";
import { FileUtils } from "../utils/file_utils.ts";
import { TextValidator } from "../validation/markdown_validator.ts";
import { PathValidator } from "../validation/path_validator.ts";
import { VariableValidator } from "../validation/variable_validator.ts";
import type { PromptReader as _PromptReader } from "./prompt_reader.ts";
import { VariableResolver } from "./variable_resolver.ts";
import type { PromptParams } from "../types/prompt_params.ts";
import { ensureFile } from "jsr:@std/fs@^0.220.1";

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
      if (templatePathOrContent.includes("/") || templatePathOrContent.includes(".")) {
        // Validate template path
        if (!templatePathOrContent || templatePathOrContent.trim() === "") {
          return { success: false, error: "Template file path is empty" };
        }

        // Check for absolute paths that are not in /tmp
        if (templatePathOrContent.startsWith("/") && !templatePathOrContent.startsWith("/tmp/")) {
          return { success: false, error: "permission denied" };
        }

        // Check for directory traversal in template path
        if (templatePathOrContent.includes("..")) {
          return { success: false, error: "Template file path contains directory traversal" };
        }

        // Validate file path format
        if (templatePathOrContent.startsWith("file://")) {
          return { success: false, error: "Template file path contains invalid characters" };
        }

        // Load template content
        try {
          templateContent = await this.loadTemplate(templatePathOrContent);
          if (!templateContent) {
            return { success: false, error: `Template not found: ${templatePathOrContent}` };
          }
        } catch (error) {
          if (error instanceof Deno.errors.PermissionDenied) {
            return { success: false, error: "permission denied" };
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

      // Extract required variables before validation
      const requiredVars = this.extractRequiredVariables(templateContent);

      // If there are no variables in the template, return the template as is
      if (requiredVars.length === 0) {
        return {
          success: true,
          prompt: templateContent,
          variables: [],
          unknownVariables: [],
        };
      }

      // Check for directory traversal in variable values
      for (const [_key, value] of Object.entries(variables)) {
        if (value.includes("..")) {
          return { success: false, error: "Variable value contains directory traversal" };
        }
      }

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
          this.variableValidator.validateVariables(variables);
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

        // Check for missing required variables
        const missingVars = requiredVars.filter((varName) => {
          if (varName.startsWith("#if ") || varName === "/if") {
            return false;
          }
          return !(varName in variables);
        });
        if (missingVars.length > 0) {
          return {
            success: false,
            error: `Missing required variables: ${missingVars.join(", ")}`,
          };
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

      // Create variable resolver and check for circular references
      const variableResolver = new VariableResolver(variables);

      // Process conditional blocks first
      let prompt = templateContent;
      const conditionalRegex = /\{#if\s+([^}]+)\}([\s\S]*?)\{\/if\}/g;
      prompt = prompt.replace(
        conditionalRegex,
        (_match: string, condition: string, content: string) => {
          const conditionValue = variables[condition];
          return conditionValue === "true" ? content : "";
        },
      ) as TextContent;

      // Replace variables in template
      const varRegex = /\{([^}]+)\}/g;
      let match;
      const matches = [];

      // Collect all matches first
      while ((match = varRegex.exec(prompt)) !== null) {
        matches.push(match);
      }

      try {
        // Process matches in reverse order to handle nested references correctly
        for (const match of matches.reverse()) {
          const varName = match[1].trim();
          // Skip conditional blocks
          if (varName.startsWith("#if ") || varName === "/if") {
            continue;
          }
          // If the variable exists in our variables object, use it, otherwise keep the original reference
          if (varName in variables) {
            try {
              const resolvedValue = variableResolver.resolveVariable(varName);
              prompt = prompt.replace(`{${varName}}`, resolvedValue) as TextContent;
            } catch (_error) {
              if (_error instanceof TemplateError) {
                return {
                  success: false,
                  error: _error.message,
                };
              }
              throw _error;
            }
          }
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

      return {
        success: true,
        prompt,
        variables: requiredVars,
        unknownVariables: [],
      };
    } catch (_error) {
      if (_error instanceof ValidationError) {
        return {
          success: false,
          error: _error.message,
        };
      }
      if (_error instanceof TemplateError) {
        return {
          success: false,
          error: _error.message,
        };
      }
      throw _error;
    }
  }

  private extractRequiredVariables(templateContent: string): string[] {
    const varRegex = /\{([^}]+)\}/g;
    const matches = new Set<string>();
    let match;

    while ((match = varRegex.exec(templateContent)) !== null) {
      const varName = match[1].trim();
      // Skip /if but include #if conditions
      if (varName !== "/if") {
        if (varName.startsWith("#if ")) {
          // Extract the condition variable from #if blocks
          const condition = varName.substring(4).trim();
          matches.add(condition);
        } else {
          // Validate variable name before adding it
          try {
            this.variableValidator.validateKey(varName);
            matches.add(varName);
          } catch (_error) {
            // If validation fails, still add the variable to the list
            // so it can be properly handled during the variable resolution phase
            matches.add(varName);
          }
        }
        this.logger.debug("Found variable in template", { varName });
      }
    }

    const result = Array.from(matches);
    this.logger.debug("Extracted required variables", { variables: result });
    return result;
  }

  /**
   * Validates the input parameters for prompt generation.
   * @param params The parameters to validate
   * @throws {ValidationError} If parameters are invalid
   */
  private validateParams(params: PromptParams): void {
    if (!params.template_file) {
      throw new ValidationError("Template file path is required");
    }

    // Validate template file path
    this.pathValidator.validateFilePath(params.template_file);

    // Validate variables if provided
    if (params.variables) {
      this.variableValidator.validateVariables(params.variables as Record<string, string>);
    }
  }

  /**
   * Loads a template from a file.
   * @param templatePath - Path to the template file
   * @returns A promise that resolves to the template content
   */
  private async loadTemplate(templatePath: string): Promise<string> {
    try {
      // Check if file exists first
      try {
        await Deno.stat(templatePath);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          return "";
        }
        if (error instanceof Deno.errors.PermissionDenied) {
          throw new Deno.errors.PermissionDenied("permission denied");
        }
        throw error;
      }

      // Only read content if file exists
      try {
        const content = await Deno.readTextFile(templatePath);
        if (!content || content.trim() === "") {
          return "";
        }
        return content;
      } catch (error) {
        if (error instanceof Deno.errors.PermissionDenied) {
          throw new Deno.errors.PermissionDenied("permission denied");
        }
        throw error;
      }
    } catch (error) {
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new Deno.errors.PermissionDenied("permission denied");
      }
      return "";
    }
  }

  /**
   * Replaces variables in a template with their values.
   * @param template - The template string
   * @param variables - Variables to replace
   * @returns The template with variables replaced
   */
  private replaceVariables(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      // Only escape special characters for non-markdown variables
      const escapedValue = key === "input_markdown" ? value : value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
      result = result.replace(new RegExp(placeholder, "g"), escapedValue);
    }
    return result;
  }

  /**
   * Writes the generated prompt to a file.
   * @param content - The prompt content to write
   * @param destinationPath - Path where the prompt should be written
   * @throws {FileSystemError} If the file cannot be written
   */
  async writePrompt(content: string, destinationPath: string): Promise<void> {
    try {
      // Validate and normalize destination path
      const normalizedPath = this.pathValidator.validateFilePath(destinationPath);

      // Check if parent directory exists and is writable
      const parentDir = normalizedPath.substring(0, normalizedPath.lastIndexOf("/"));
      try {
        await Deno.stat(parentDir);
      } catch (error) {
        if (error instanceof Deno.errors.NotFound) {
          await Deno.mkdir(parentDir, { recursive: true });
        } else {
          throw error;
        }
      }

      // Create file if it doesn't exist
      await ensureFile(normalizedPath);

      // Write content to file
      await this.fileUtils.writeFile(normalizedPath, content);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new FileSystemError(
        `Failed to write prompt: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Validates text content.
   * @param text - The text content to validate
   * @throws {ValidationError} If the text is invalid
   */
  private validateText(text: string): void {
    if (!this.textValidator.validateText(text)) {
      throw new ValidationError("Invalid text content");
    }
  }

  /**
   * Processes a template file with the given variables.
   * @param templatePath - Path to the template file
   * @param variables - Variables to replace in the template
   * @returns The processed template content
   * @throws {Error} If template processing fails
   */
  async processTemplate(
    templatePath: string,
    variables: Record<string, unknown>,
  ): Promise<string> {
    try {
      // Validate template path
      this.pathValidator.validateFilePath(templatePath);

      // Read template file
      const templateContent = await this.fileUtils.readFile(templatePath);

      // Process template content
      const result = await this.generatePrompt(
        templateContent,
        variables as Record<string, string>,
      );
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.prompt;
    } catch (_error) {
      // Log error and rethrow
      this.logger.error(`Failed to process template: ${templatePath}`);
      throw new Error(`Failed to process template: ${templatePath}`);
    }
  }
}
