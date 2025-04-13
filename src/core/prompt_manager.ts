import type { PromptParams } from "../types/prompt_params.ts";
import type { PromptResult as _PromptResult } from "../types/prompt_result.ts";
import {
  FileSystemError,
  type TemplateError as _TemplateError,
  ValidationError,
} from "../errors.ts";
import { ensureFile } from "@std/fs";
import type { exists as _exists } from "@std/fs";
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
    template: string,
    variables: Record<string, string>,
  ): Promise<{ success: boolean; prompt: string }> {
    try {
      // Validate template path
      if (!template || template.trim() === "") {
        throw new ValidationError("Template file path is empty");
      }

      // Validate path characters
      if (!/^[a-zA-Z0-9\/\-_\.]+$/.test(template)) {
        throw new ValidationError("Invalid file path: Contains invalid characters");
      }

      // Prevent directory traversal
      if (
        template.includes("..") || template.startsWith("/") || template.startsWith("\\")
      ) {
        throw new ValidationError("Invalid file path: Contains directory traversal");
      }

      // Validate variables
      for (const [key, value] of Object.entries(variables)) {
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
          throw new ValidationError(`Invalid variable name: ${key}`);
        }
        if (typeof value !== "string") {
          throw new ValidationError(`${key} must be a string`);
        }

        // Validate file paths in variables
        if (key.endsWith("_file") || key.endsWith("_path")) {
          // Validate path characters
          if (!/^[a-zA-Z0-9\/\-_\.]+$/.test(value)) {
            throw new ValidationError(`Invalid file path in ${key}: Contains invalid characters`);
          }

          // Prevent directory traversal
          if (value.includes("..") || value.startsWith("/") || value.startsWith("\\")) {
            throw new ValidationError(`Invalid file path in ${key}: Contains directory traversal`);
          }
        }
      }

      const content = await this.loadTemplate(template);
      const prompt = this.replaceVariables(content, variables);
      return { success: true, prompt };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof FileSystemError) {
        throw error;
      }
      throw new FileSystemError(`Template not found: ${template}`);
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
      const content = await Deno.readTextFile(templateFile);
      if (!content || content.trim() === "") {
        throw new ValidationError("Template is empty");
      }
      return content;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new FileSystemError(`Template not found: ${templateFile}`);
      }
      throw error;
    }
  }

  private replaceVariables(
    template: string,
    variables: Record<string, string>,
    _preservePlaceholders = false,
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

  async writePrompt(content: string, destinationPath: string): Promise<void> {
    // Validate destination path
    if (!destinationPath || destinationPath.trim() === "") {
      throw new ValidationError("Empty destination path");
    }

    // Validate path characters
    if (!/^[a-zA-Z0-9\/\-_\.]+$/.test(destinationPath)) {
      throw new ValidationError("Invalid destination path: Contains invalid characters");
    }

    // Prevent directory traversal
    if (
      destinationPath.includes("..") || destinationPath.startsWith("/") ||
      destinationPath.startsWith("\\")
    ) {
      throw new ValidationError("Invalid destination path: Contains directory traversal");
    }

    try {
      // Check if parent directory exists and is writable
      const parentDir = destinationPath.substring(0, destinationPath.lastIndexOf("/"));
      try {
        const dirInfo = await Deno.stat(parentDir);
        if (!dirInfo.isDirectory) {
          throw new FileSystemError("Parent path is not a directory");
        }
      } catch (error: unknown) {
        if (error instanceof Deno.errors.NotFound) {
          throw new FileSystemError("Parent directory not found");
        }
        if (error instanceof Deno.errors.PermissionDenied) {
          throw new FileSystemError("Permission denied");
        }
        throw new FileSystemError(
          `Failed to access parent directory: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }

      await ensureFile(destinationPath);
      await Deno.writeTextFile(destinationPath, content);
    } catch (error: unknown) {
      if (error instanceof Deno.errors.NotFound) {
        throw new FileSystemError("Failed to create file: Directory not found");
      }
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new FileSystemError("Permission denied");
      }
      throw new FileSystemError(
        `Failed to write prompt file: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private validateMarkdown(markdown: string): Promise<void> {
    if (!markdown || typeof markdown !== "string") {
      return Promise.reject(new ValidationError("Invalid markdown content"));
    }
    return Promise.resolve();
  }
}
