/**
 * Error Handler
 *
 * Purpose:
 * - Handle different types of errors in the application
 * - Format error messages consistently
 * - Provide error recovery mechanisms
 * - Log errors appropriately
 */

import type { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";

export interface ErrorResult {
  type: string;
  message: string;
  stack?: string;
  details?: Record<string, unknown>;
}

export interface RecoveryResult {
  success: boolean;
  message?: string;
}

export interface ErrorHandlerOptions {
  preserveStack?: boolean;
  details?: Record<string, unknown>;
}

export class ErrorHandler {
  private logger: BreakdownLogger;

  constructor(logger: BreakdownLogger) {
    this.logger = logger;
  }

  /**
   * Handle an error and return a formatted result
   * @param error The error to handle
   * @param options Options for error handling
   * @returns Formatted error result
   */
  handle(error: Error, options: ErrorHandlerOptions = {}): ErrorResult {
    const type = error instanceof ValidationError ? "ValidationError" : "SystemError";
    const result: ErrorResult = {
      type,
      message: error.message,
      details: options.details || {},
    };

    if (options.preserveStack) {
      result.stack = error.stack;
    }

    this.logger.error("Error handled", { error });
    return result;
  }

  /**
   * Format an error for display
   * @param error The error to format
   * @returns Formatted error message
   */
  formatError(error: Error): string {
    const type = error instanceof ValidationError ? "ValidationError" : "SystemError";
    return `[${type}] ${error.message}`;
  }

  /**
   * Attempt to recover from an error
   * @param error The error to recover from
   * @returns Recovery result
   */
  recover(error: Error): RecoveryResult {
    if (error instanceof ValidationError) {
      this.logger.info("Recovering from validation error", { error });
      return { success: true };
    }
    this.logger.error("Cannot recover from system error", { error });
    return { success: false };
  }
}
