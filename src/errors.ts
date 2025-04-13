/**
 * Represents a validation error that occurs when input validation fails.
 * @extends Error
 */
export class ValidationError extends Error {
  code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Represents an error that occurs during template processing.
 * @extends Error
 */
export class TemplateError extends Error {
  code = "TEMPLATE_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "TemplateError";
  }
}

/**
 * Represents an error that occurs during file system operations.
 * @extends Error
 */
export class FileSystemError extends Error {
  code = "FILE_SYSTEM_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "FileSystemError";
  }
}
