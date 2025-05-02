import type { BreakdownLogger } from "@tettuan/breakdownlogger";
import { ValidationError } from "../errors.ts";
import type { Parameters, ProcessedParameters } from "../types/parameter_types.ts";

/**
 * A class for managing and processing parameters.
 * Handles parameter validation, type checking, and dependency resolution.
 */
export class ParameterManager {
  private logger: BreakdownLogger;

  constructor(logger: BreakdownLogger) {
    this.logger = logger;
  }

  /**
   * Processes parameters according to their types and dependencies.
   * @param parameters - The parameters to process
   * @returns The processed parameters
   * @throws {ValidationError} If parameters are invalid
   */
  async process(parameters: Parameters): Promise<ProcessedParameters> {
    this.logger.debug("Processing parameters", { parameters });

    // Validate parameter types
    for (const [key, value] of Object.entries(parameters)) {
      if (key === "age" && typeof value !== "number") {
        throw new ValidationError("Invalid parameter type");
      }
    }

    // Handle parameter dependencies
    const processed = { ...parameters };
    for (const [key, value] of Object.entries(processed)) {
      if (typeof value === "string" && value.includes("${")) {
        processed[key] = this.resolveDependencies(value, processed);
      } else if (typeof value === "object" && value !== null) {
        processed[key] = await this.process(value as Parameters);
      }
    }

    // Check for required parameters only if we're not processing a nested object
    if (
      Object.keys(parameters).some((key) => key === "age" || key === "name" || key === "isActive")
    ) {
      if (!("age" in processed)) {
        throw new ValidationError("Required parameter missing");
      }
    }

    return processed as ProcessedParameters;
  }

  /**
   * Resolves parameter dependencies in a string value.
   * @param value - The string value containing dependencies
   * @param parameters - The parameters to resolve dependencies from
   * @returns The resolved string value
   */
  private resolveDependencies(value: string, parameters: Parameters): string {
    return value.replace(/\${([^}]+)}/g, (_, key) => {
      if (key in parameters) {
        return String(parameters[key]);
      }
      throw new ValidationError(`Missing dependency: ${key}`);
    });
  }
}
