import { BreakdownLogger } from "jsr:@tettuan/breakdownlogger@0.1.10";
import type { PromptParams } from "../types/prompt_params.ts";
import type { PromptResult } from "../types/prompt_result.ts";
import { FileSystemError, ValidationError, TemplateError } from "../errors.ts";
import { ensureFile } from "@std/fs";
import { exists } from "@std/fs";
import { MarkdownValidator } from "../validation/markdown_validator.ts";

export class PromptManager {
  private logger: BreakdownLogger;
  private markdownValidator: MarkdownValidator;

  constructor(logger: BreakdownLogger = new BreakdownLogger()) {
    this.logger = logger;
    this.markdownValidator = new MarkdownValidator();
  }

  async generatePrompt(template_file: string, variables: Record<string, string> = {}): Promise<PromptResult> {
    const params: PromptParams = {
      template_file,
      variables,
    };

    try {
      await this.validateParams(params);
      const template = await this.loadTemplate(params.template_file);
      const prompt = this.replaceVariables(template, params.variables);
      return {
        success: true,
        prompt,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Failed to generate prompt: ${errorMessage}`);
      throw error; // Re-throw the original error to maintain error types
    }
  }

  private async validateParams(params: PromptParams): Promise<void> {
    if (!params.template_file) {
      throw new ValidationError("Template file path is required");
    }

    if (!/^[a-zA-Z0-9\/\-_\.]+$/.test(params.template_file)) {
      throw new ValidationError("Invalid file path: Contains invalid characters");
    }

    if (params.template_file.includes("..")) {
      throw new ValidationError("Invalid file path: Contains directory traversal");
    }

    try {
      await Deno.stat(params.template_file);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new FileSystemError("File not found");
      }
      throw error;
    }

    // Validate variables if provided
    if (params.variables) {
      for (const [key, value] of Object.entries(params.variables)) {
        if (typeof value !== "string") {
          throw new ValidationError(`${key} must be a string`);
        }
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }

        // Validate markdown content
        if (key === "input_markdown" && !this.markdownValidator.validateMarkdown(value)) {
          throw new ValidationError("Input markdown content must be a string");
        }
      }
    }
  }

  private async loadTemplate(templateFile: string): Promise<string> {
    try {
      const template = await Deno.readTextFile(templateFile);
      if (!template.trim()) {
        throw new TemplateError("Template cannot be empty");
      }
      return template;
    } catch (error: unknown) {
      if (error instanceof TemplateError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new FileSystemError(`Failed to read template file: ${message}`);
    }
  }

  private replaceVariables(template: string, variables: Record<string, string> = {}): string {
    let prompt = template;
    
    // First, handle escaped variables (e.g., \{var\})
    prompt = prompt.replace(/\\{([^}]+)\\}/g, (match) => {
      return match.replace(/\\/g, '');
    });

    // Then handle nested variables (e.g., {var_{another_var}})
    const nestedVarRegex = /\{([^{}]+)\{([^{}]+)\}\}/g;
    while (nestedVarRegex.test(prompt)) {
      prompt = prompt.replace(nestedVarRegex, (match, outer, inner) => {
        const innerValue = variables[inner] || '';
        return `{${outer}${innerValue}}`;
      });
    }

    // Finally, replace regular variables
    const varRegex = /\{([^{}]+)\}/g;
    prompt = prompt.replace(varRegex, (match, key) => {
      return variables[key] || '';
    });

    // Preserve line endings and whitespace
    return prompt;
  }

  async writePrompt(content: string, destinationPath: string): Promise<void> {
    try {
      await ensureFile(destinationPath);
      await Deno.writeTextFile(destinationPath, content);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new FileSystemError(`Failed to write prompt file: ${message}`);
    }
  }
}
