import { VariableReplacer, PromptResult } from "./types.ts";
import { SchemaFileReplacer } from "./replacers/schema_file_replacer.ts";
import { InputMarkdownReplacer } from "./replacers/input_markdown_replacer.ts";
import { InputMarkdownFileReplacer } from "./replacers/input_markdown_file_replacer.ts";
import { DestinationPathReplacer } from "./replacers/destination_path_replacer.ts";

export class PromptGenerator {
  private variables: Map<string, VariableReplacer>;

  constructor() {
    this.variables = new Map();
    this.registerDefaultReplacers();
  }

  private registerDefaultReplacers(): void {
    this.variables.set("schema_file", new SchemaFileReplacer());
    this.variables.set("input_markdown", new InputMarkdownReplacer());
    this.variables.set("input_markdown_file", new InputMarkdownFileReplacer());
    this.variables.set("destination_path", new DestinationPathReplacer());
  }

  public registerReplacer(name: string, replacer: VariableReplacer): void {
    this.variables.set(name, replacer);
  }

  public parseTemplate(template: string): PromptResult {
    const variablePattern = /\{([^}]+)\}/g;
    const variables = new Map<string, string>();
    const content = template;

    let match;
    while ((match = variablePattern.exec(template)) !== null) {
      const [fullMatch, varName] = match;
      if (!this.variables.has(varName)) {
        throw new Error(`Unknown variable: ${varName}`);
      }
      variables.set(varName, fullMatch);
    }

    return {
      content,
      metadata: {
        template,
        variables,
        timestamp: new Date(),
      },
    };
  }

  public replaceVariables(result: PromptResult, values: Map<string, unknown>): string {
    let content = result.content;

    for (const [varName, value] of values) {
      const replacer = this.variables.get(varName);
      if (!replacer) {
        throw new Error(`No replacer found for variable: ${varName}`);
      }

      if (!replacer.validate(value)) {
        throw new Error(`Invalid value for variable: ${varName}`);
      }

      const replacement = replacer.replace(value);
      const pattern = new RegExp(`\\{${varName}\\}`, "g");
      content = content.replace(pattern, replacement);
    }

    return content;
  }
} 