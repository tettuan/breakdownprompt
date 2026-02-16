/**
 * Prompt Manager
 *
 * Purpose:
 * - Thin orchestrator for prompt generation
 * - Delegates template loading to TemplateLoader
 * - Delegates variable operations to VariableReplacer
 */

import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";
import type { PromptResult } from "../types/prompt_result.ts";
import { FileUtils } from "../utils/file_utils.ts";
import type { TextValidator as _TextValidator } from "../validation/markdown_validator.ts";
import { PathValidator } from "../validation/path_validator.ts";
import { VariableValidator } from "../validation/variable_validator.ts";
import { TemplateLoader } from "./template_loader.ts";
import { VariableReplacer } from "./variable_replacer.ts";

/**
 * A class for managing and generating prompts from templates with variable replacement.
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
  private readonly templateLoader: TemplateLoader;
  private readonly variableReplacer: VariableReplacer;
  private readonly fileUtils: FileUtils;
  private readonly logger: BreakdownLogger;

  constructor(
    _textValidator?: _TextValidator,
    pathValidator: PathValidator = new PathValidator(),
    variableValidator: VariableValidator = new VariableValidator(),
    fileUtils: FileUtils = new FileUtils(),
    logger: BreakdownLogger = new BreakdownLogger("prompt"),
  ) {
    this.fileUtils = fileUtils;
    this.logger = logger;
    this.templateLoader = new TemplateLoader(pathValidator, fileUtils, logger);
    this.variableReplacer = new VariableReplacer(logger, variableValidator);
  }

  /**
   * Generates a prompt by replacing variables in a template.
   * @param templatePathOrContent - Path to the template file or the template content itself
   * @param variables - A record of variable names and their replacement values
   * @returns A promise that resolves to the generated prompt result
   */
  public async generatePrompt(
    templatePathOrContent: string,
    variables: Record<string, string>,
  ): Promise<PromptResult> {
    this.logger.debug("generatePrompt called", {
      templatePathOrContent: templatePathOrContent.substring(0, 80),
      variableKeys: Object.keys(variables),
    });

    try {
      // 1. Load template (file or inline)
      const { content, templatePath } = await this.templateLoader.load(
        templatePathOrContent,
      );

      // 2. Extract detected variables
      const detected = this.variableReplacer.extractVariables(content);

      // 3. Validate variable keys
      try {
        this.variableReplacer.validateKeys(variables);
      } catch (error) {
        if (error instanceof ValidationError) {
          return {
            success: false,
            error: error.message,
            templatePath,
            variables: { detected, replaced: [], remaining: [] },
          };
        }
        throw error;
      }

      // 4. Replace variables
      const { content: result, replaced, remaining } = this.variableReplacer.replaceAll(
        content,
        variables,
      );

      // 5. Return success result
      this.logger.debug("generatePrompt returning success", {
        templatePath,
        detected: detected.length,
        replaced: replaced.length,
        remaining: remaining.length,
      });

      return {
        success: true,
        templatePath,
        content: result,
        variables: { detected, replaced, remaining },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        this.logger.error("generatePrompt failed", {
          error: error.message,
        });
        return {
          success: false,
          error: error.message,
          templatePath: templatePathOrContent,
          variables: { detected: [], replaced: [], remaining: [] },
        };
      }
      throw error;
    }
  }

  /**
   * Writes a prompt to a file.
   * @param content - The prompt content to write
   * @param destinationPath - Path to write the prompt to
   */
  async writePrompt(content: string, destinationPath: string): Promise<void> {
    this.logger.debug("writePrompt called", {
      contentLength: content.length,
      destinationPath,
    });
    try {
      await this.fileUtils.writeFile(destinationPath, content);
      this.logger.debug("writePrompt completed", { destinationPath });
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        this.logger.error("writePrompt failed: directory not found", {
          destinationPath,
        });
        throw new Error(`Cannot write to file: ${destinationPath}`);
      }
      this.logger.error("writePrompt failed: unexpected error", {
        destinationPath,
        error: String(error),
      });
      throw error;
    }
  }
}
