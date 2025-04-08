export class ValidationError extends Error {
  code = "VALIDATION_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class TemplateError extends Error {
  code = "TEMPLATE_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "TemplateError";
  }
}

export class FileSystemError extends Error {
  code = "FILE_SYSTEM_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "FileSystemError";
  }
}
