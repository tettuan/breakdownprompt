/**
 * Parameters for prompt generation.
 * @interface PromptParams
 */
export interface PromptParams {
  /** Path to the prompt template file */
  prompt_file_path: string;
  /** Variables to replace in the template */
  variables: Record<string, unknown>;
}

/**
 * Result of prompt generation.
 * @interface PromptResult
 */
export interface PromptResult {
  /** Generated prompt content */
  content: string;
  /** List of variables found in the template */
  variables: string[];
  /** List of unknown variables found in the template */
  unknownVariables?: string[];
}

/**
 * Interface for variable replacement.
 * @interface VariableReplacer
 */
export interface VariableReplacer {
  /** Validate the replacement value */
  validate(value: unknown): boolean;
  /** Replace the variable with its value */
  replace(value: unknown): string;
}

/**
 * Valid variable key type.
 * Ensures keys follow naming rules:
 * - English alphanumeric and underscore only
 * - Must start with a letter
 * - Case sensitive
 */
export type ValidVariableKey = string & {
  readonly _brand: unique symbol;
};

/**
 * File path type.
 * Ensures value is a valid file path.
 */
export type FilePath = string & {
  readonly _type: "file_path";
};

/**
 * Directory path type.
 * Ensures value is a valid directory path.
 */
export type DirectoryPath = string & {
  readonly _type: "directory_path";
};

/**
 * Markdown text type.
 * Ensures value is valid markdown format.
 */
export type MarkdownText = string & {
  readonly _type: "markdown_text";
};

/**
 * Variables type.
 * All keys are optional (Partial type).
 * Keys must conform to ValidVariableKey.
 * Values must be FilePath, DirectoryPath, or MarkdownText.
 */
export type Variables = Partial<
  {
    [K in ValidVariableKey]: FilePath | DirectoryPath | MarkdownText;
  }
>;

/**
 * Custom error types for the application.
 */

export class PromptError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "PromptError";
  }
}

export class TemplateError extends PromptError {
  constructor(message: string) {
    super(message, "TEMPLATE_ERROR");
    this.name = "TemplateError";
  }
}

export class VariableError extends PromptError {
  constructor(message: string) {
    super(message, "VARIABLE_ERROR");
    this.name = "VariableError";
  }
}

export class FileSystemError extends PromptError {
  constructor(message: string) {
    super(message, "FILE_SYSTEM_ERROR");
    this.name = "FileSystemError";
  }
}

export class ValidationError extends PromptError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
