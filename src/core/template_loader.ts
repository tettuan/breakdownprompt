/**
 * Template Loader
 *
 * Purpose:
 * - Determine if input is a file path or inline content
 * - Validate and load template files
 * - Check for empty templates
 */

import type { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";
import { PermissionErrorMessages } from "../errors/permission_errors.ts";
import type { FileUtils } from "../utils/file_utils.ts";
import type { PathValidator } from "../validation/path_validator.ts";

export interface TemplateLoadResult {
  content: string;
  templatePath: string;
}

export class TemplateLoader {
  private readonly pathValidator: PathValidator;
  private readonly fileUtils: FileUtils;
  private readonly logger: BreakdownLogger;

  constructor(
    pathValidator: PathValidator,
    fileUtils: FileUtils,
    logger: BreakdownLogger,
  ) {
    this.pathValidator = pathValidator;
    this.fileUtils = fileUtils;
    this.logger = logger;
  }

  isFilePath(input: string): boolean {
    const result = input.includes("/");
    this.logger.debug("isFilePath decision", {
      input: input.substring(0, 40),
      isFile: result,
    });
    return result;
  }

  async load(input: string): Promise<TemplateLoadResult> {
    this.logger.debug("TemplateLoader.load called", {
      input: input.substring(0, 80),
    });

    let content: string;
    let templatePath: string;

    if (this.isFilePath(input)) {
      templatePath = input;

      await this.pathValidator.validateFilePath(templatePath);

      try {
        content = await this.fileUtils.readFile(templatePath);
      } catch (error) {
        if (error instanceof Deno.errors.PermissionDenied) {
          this.logger.error("PermissionDenied reading template", {
            templatePath,
          });
          throw new ValidationError(
            `${PermissionErrorMessages.READ_TEMPLATE}: Cannot read template file at ${templatePath}`,
          );
        }
        this.logger.error("Unexpected error reading template", {
          templatePath,
          error: String(error),
        });
        throw error;
      }

      if (!content) {
        throw new ValidationError(`Template not found: ${templatePath}`);
      }
    } else {
      content = input;
      templatePath = "inline";
    }

    if (!content || content.trim() === "") {
      throw new ValidationError("Template is empty");
    }

    this.logger.debug("TemplateLoader.load returning", {
      templatePath,
      contentLength: content.length,
    });

    return { content, templatePath };
  }
}
