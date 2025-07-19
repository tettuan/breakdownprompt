/**
 * Variable Resolver
 *
 * Purpose:
 * - Resolve variable references in templates
 * - Handle variable dependencies and circular references
 * - Support optional variables
 */

import { TemplateError, ValidationError } from "../errors.ts";

/**
 * A class for resolving variables in a template.
 *
 * @class VariableResolver
 * @description
 * This class handles variable replacement in templates and detects circular references.
 * It maintains state to track visited and resolving variables to prevent infinite loops.
 *
 * @property {Record<string, string>} variables - The variables to resolve
 * @property {Set<string>} visited - Set of variables that have been visited
 * @property {Set<string>} resolving - Set of variables currently being resolved
 * @property {Map<string, string>} resolvedVars - Cache of resolved variable values
 *
 * @example
 * ```typescript
 * const resolver = new VariableResolver({
 *   name: "John",
 *   greeting: "Hello, {name}!"
 * });
 * const result = resolver.resolveVariable("greeting");
 * // result: "Hello, John!"
 * ```
 */
export class VariableResolver {
  private variables: Record<string, string>;
  private visited: Set<string>;
  private resolving: Set<string>;
  private resolvedVars: Map<string, string>;
  private readonly VALID_KEY_REGEX = /^(uv-[a-zA-Z0-9_]+|[a-zA-Z][a-zA-Z0-9_]*)$/;

  /**
   * Creates a new VariableResolver instance.
   * @param variables - A record of variable names and their values
   */
  constructor(variables: Record<string, string>) {
    this.variables = variables;
    this.resolvedVars = new Map();
    this.visited = new Set();
    this.resolving = new Set();
  }

  /**
   * Validates a variable name.
   * @param varName - The name of the variable to validate
   * @throws {ValidationError} If the variable name is invalid
   */
  private validateVariableName(varName: string): void {
    if (!varName || typeof varName !== "string") {
      throw new ValidationError("Invalid variable name");
    }

    if (!this.VALID_KEY_REGEX.test(varName)) {
      if (varName.includes("-")) {
        throw new ValidationError(
          `Invalid variable name: ${varName} (variable names cannot contain hyphens)`,
        );
      }
      throw new ValidationError(`Invalid variable name: ${varName}`);
    }
  }

  /**
   * Resolves a variable by replacing references to other variables.
   * @param varName - The name of the variable to resolve
   * @param path - The current path of variable resolution (for circular reference detection)
   * @returns The resolved value of the variable or empty string if variable is not found
   * @throws {TemplateError} If a circular reference is detected
   * @throws {ValidationError} If the variable name is invalid
   */
  public resolveVariable(varName: string, path = new Set<string>()): string {
    // Validate variable name
    if (!varName || varName.trim() === "") {
      throw new ValidationError("Variable name cannot be empty");
    }

    // Validate variable name
    this.validateVariableName(varName);

    // Check for circular reference
    if (path.has(varName)) {
      throw new TemplateError("Circular variable reference detected");
    }

    // Return cached value if available
    if (this.resolvedVars.has(varName)) {
      return this.resolvedVars.get(varName)!;
    }

    // Return empty string if variable doesn't exist (optional variable)
    if (!(varName in this.variables)) {
      return "";
    }

    const value = this.variables[varName];
    if (value === undefined || value === null || value.trim() === "") {
      return "";
    }

    // Check for circular reference in resolution process
    if (this.resolving.has(varName)) {
      throw new TemplateError("Circular variable reference detected");
    }

    // Add to path and mark as resolving
    path.add(varName);
    this.visited.add(varName);
    this.resolving.add(varName);

    try {
      // Return the value as is, without processing nested variables
      this.resolvedVars.set(varName, value);
      return value;
    } finally {
      // Clean up
      path.delete(varName);
      this.resolving.delete(varName);
    }
  }

  /**
   * Resolves variables in a template string.
   * @param template - The template string containing variables to resolve
   * @returns The resolved template string
   * @throws {TemplateError} If a circular reference is detected
   * @throws {ValidationError} If any variable name is invalid
   */
  public resolveTemplate(template: string): string {
    if (!template || template.trim() === "") {
      return "";
    }

    let resolvedTemplate = template;
    const varRegex = /\{([^}]+)\}/g;
    let match;

    while ((match = varRegex.exec(template)) !== null) {
      const varName = match[1].trim();

      try {
        // Try to resolve the variable
        const value = this.resolveVariable(varName);
        resolvedTemplate = resolvedTemplate.replace(`{${varName}}`, value);
      } catch (error) {
        if (error instanceof ValidationError) {
          throw error;
        }
        if (error instanceof TemplateError) {
          throw error;
        }
        throw error;
      }
    }

    return resolvedTemplate;
  }

  /**
   * Gets the set of visited variables.
   * @returns A set of variable names that have been visited
   */
  public getVisitedVars(): Set<string> {
    return this.visited;
  }
}
