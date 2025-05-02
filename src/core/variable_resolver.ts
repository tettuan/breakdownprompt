import { TemplateError, ValidationError } from "../errors.ts";

/**
 * A class for resolving variables in a template.
 * Handles variable replacement and circular reference detection.
 */
export class VariableResolver {
  private variables: Record<string, string>;
  private visited: Set<string>;
  private resolving: Set<string>;
  private resolvedVars: Map<string, string>;

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
   * Resolves a variable by replacing references to other variables.
   * @param varName - The name of the variable to resolve
   * @param path - The current path of variable resolution (for circular reference detection)
   * @returns The resolved value of the variable
   * @throws {TemplateError} If a circular reference is detected
   * @throws {ValidationError} If the variable name is invalid
   */
  public resolveVariable(varName: string, path = new Set<string>()): string {
    // Validate variable name
    if (!varName || varName.trim() === "") {
      throw new ValidationError("Variable name cannot be empty");
    }

    // Skip conditional blocks
    if (varName.startsWith("#if ") || varName === "/if") {
      return this.variables[varName] || "";
    }

    // Check for circular reference
    if (path.has(varName)) {
      throw new TemplateError("Circular variable reference detected");
    }

    // Return cached value if available
    if (this.resolvedVars.has(varName)) {
      return this.resolvedVars.get(varName)!;
    }

    // Check if variable exists
    if (!(varName in this.variables)) {
      throw new ValidationError(`Missing required variable: ${varName}`);
    }

    const value = this.variables[varName];
    if (value === undefined || value === null || value.trim() === "") {
      throw new ValidationError(`Invalid value for variable: ${varName}`);
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
      // Replace all variable references in the value
      let resolvedValue = value;
      const varRegex = /\{([^}]+)\}/g;
      let match;
      const matches = [];

      // Collect all matches first
      while ((match = varRegex.exec(value)) !== null) {
        matches.push(match);
      }

      // Process matches in reverse order to handle nested references correctly
      for (const match of matches.reverse()) {
        const refVarName = match[1].trim();
        // Skip conditional blocks
        if (refVarName.startsWith("#if ") || refVarName === "/if") {
          continue;
        }
        // Check for circular reference
        if (path.has(refVarName)) {
          throw new TemplateError("Circular variable reference detected");
        }
        // Check if referenced variable exists
        if (!(refVarName in this.variables)) {
          throw new ValidationError(`Missing required variable: ${refVarName}`);
        }
        // Resolve referenced variable
        const resolvedRef = this.resolveVariable(refVarName, new Set(path));
        // Replace reference with resolved value, preserving whitespace
        resolvedValue = resolvedValue.replace(match[0], () => {
          // Preserve leading and trailing whitespace from the original value
          const leadingWhitespace = match[0].match(/^\s*/)?.[0] || "";
          const trailingWhitespace = match[0].match(/\s*$/)?.[0] || "";
          return leadingWhitespace + resolvedRef + trailingWhitespace;
        });
      }

      // Cache and return resolved value
      this.resolvedVars.set(varName, resolvedValue);
      return resolvedValue;
    } finally {
      // Clean up path and resolving state
      path.delete(varName);
      this.resolving.delete(varName);
    }
  }

  /**
   * Gets the set of visited variables.
   * @returns A set of variable names that have been visited
   */
  public getVisitedVars(): Set<string> {
    return this.visited;
  }
}
