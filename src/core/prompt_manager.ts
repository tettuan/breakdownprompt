import type { PromptParams } from "../types/prompt_params.ts";
import type { PromptResult } from "../types/prompt_result.ts";
import { FileSystemError, ValidationError, TemplateError } from "../errors.ts";
import { ensureFile } from "@std/fs";
import { exists } from "@std/fs";
import { MarkdownValidator } from "../validation/markdown_validator.ts";
import type { BreakdownLogger } from "@tettuan/breakdownlogger";

export class PromptManager {
  private markdownValidator: MarkdownValidator;
  private logger?: BreakdownLogger;

  constructor(logger?: BreakdownLogger) {
    this.markdownValidator = new MarkdownValidator();
    this.logger = logger;
  }

  public async generatePrompt(
    templatePath: string,
    variables: Record<string, string> = {},
    options: {
      validateMarkdown?: boolean;
      preservePlaceholders?: boolean;
    } = {}
  ): Promise<PromptResult> {
    const { validateMarkdown = true, preservePlaceholders = false } = options;

    try {
      // Validate variables if provided
      for (const [key, value] of Object.entries(variables)) {
        if (typeof value !== "string") {
          throw new ValidationError(`${key} must be a string`);
        }
        if (key === "input_markdown" && !this.markdownValidator.validateMarkdown(value)) {
          throw new ValidationError("Input markdown content must be a string");
        }
      }

      // Load and validate template
      const template = await this.loadTemplate(templatePath);
      if (!template) {
        throw new Error(`Template not found: ${templatePath}`);
      }

      // Replace variables
      const prompt = await this.replaceVariables(template, variables, preservePlaceholders);

      // Validate markdown if requested
      if (validateMarkdown) {
        await this.validateMarkdown(prompt);
      }

      return {
        success: true,
        prompt,
      };
    } catch (error) {
      this.logger?.error(`Failed to generate prompt: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
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
    // Validate template path
    if (!/^[a-zA-Z0-9\/\-_\.]+$/.test(templateFile)) {
      throw new ValidationError("Invalid file path: Contains invalid characters");
    }

    if (templateFile.includes("..")) {
      throw new ValidationError("Invalid file path: Contains directory traversal");
    }

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
      if (error instanceof Deno.errors.NotFound || (error instanceof Error && error.message.includes("No such file or directory"))) {
        throw new FileSystemError(`Failed to read template file: ${error instanceof Error ? error.message : String(error)}`);
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new FileSystemError(`Failed to read template file: ${message}`);
    }
  }

  private async replaceVariables(template: string, variables: Record<string, string> = {}, preservePlaceholders = false): Promise<string> {
    // Process line by line to preserve trailing spaces
    const lines = template.split(/\r?\n/);
    const processedLines = await Promise.all(lines.map(async (line) => {
      let processedLine = line;
      let lastIndex = 0;
      let result = "";

      // First pass: handle escaped variables
      processedLine = processedLine.replace(/\\{([^{}]+)\\}/g, (match) => {
        // Remove escape characters but preserve the braces
        return match.replace(/\\/g, "");
      });

      // Second pass: handle nested variables
      const varRegex = /{([^{}]+)}/g;
      let match;

      while ((match = varRegex.exec(processedLine)) !== null) {
        const [fullMatch, key] = match;
        const matchStart = match.index;
        const matchEnd = matchStart + fullMatch.length;

        // Add content before the match
        result += processedLine.slice(lastIndex, matchStart);

        // Check if this is a nested variable
        if (key.includes("{") && key.includes("}")) {
          // Keep the original placeholder for nested variables
          result += fullMatch;
        } else if (preservePlaceholders) {
          // Keep the original placeholder if preservePlaceholders is true
          result += fullMatch;
        } else if (variables.hasOwnProperty(key)) {
          // Replace the variable with its value
          result += variables[key];
        } else {
          // Remove the placeholder when no value is provided
          result += "";
        }

        lastIndex = matchEnd;
      }

      // Add any remaining content
      result += processedLine.slice(lastIndex);

      // Preserve trailing spaces
      const trailingSpaces = line.match(/\s*$/)?.[0] || "";
      return result + trailingSpaces;
    }));

    // Join lines with original line endings
    return processedLines.join("\n");
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

  private async validateMarkdown(markdown: string): Promise<void> {
    try {
      // Basic markdown validation
      if (!markdown.trim()) {
        throw new Error("Generated prompt is empty");
      }

      // Check for unclosed code blocks
      const codeBlockCount = (markdown.match(/```/g) || []).length;
      if (codeBlockCount % 2 !== 0) {
        throw new Error("Unclosed code block detected");
      }
    } catch (error) {
      this.logger?.error(`Markdown validation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}
