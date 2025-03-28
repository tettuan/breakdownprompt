import type { PromptParams, PromptResult } from "./types.ts";
import { PromptGenerator } from "./prompt_generator.ts";
import { OutputController } from "./output_controller.ts";

export class PromptManager {
  constructor() {}

  public async generatePrompt(params: PromptParams): Promise<PromptResult> {
    this.validateParams(params);
    const template = await this.loadTemplate(params);
    const generator = new PromptGenerator();
    const result = generator.parseTemplate(template);

    // Check for unknown variables
    const unknownVariables = this.findUnknownVariables(result.content);
    if (unknownVariables.length > 0) {
      throw new Error(`Unknown variable: ${unknownVariables[0]}`);
    }

    const values = new Map<string, unknown>();
    // Add values based on params
    values.set("schema_file", `${params.prompt_file_path}/schema.json`);
    values.set("input_markdown_file", `${params.prompt_file_path}/input.md`);
    values.set("destination_path", params.destination);

    const content = generator.replaceVariables(result, values);

    const outputController = new OutputController(
      params.destination,
      params.multipleFiles,
      params.structured,
    );

    const outputResult = await outputController.generateOutput(content);
    if (!outputResult.success) {
      throw new Error(outputResult.error ?? "Output generation failed");
    }

    return { content };
  }

  private validateParams(params: PromptParams): void {
    if (!params.prompt_file_path) {
      throw new Error("Prompt file path is required");
    }
    if (!params.destination) {
      throw new Error("Destination is required");
    }
  }

  private async loadTemplate(params: PromptParams): Promise<string> {
    try {
      return await Deno.readTextFile(params.prompt_file_path);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load template: ${error.message}`);
      }
      throw new Error("Failed to load template: Unknown error");
    }
  }

  private findUnknownVariables(template: string): string[] {
    const variablePattern = /{([^}]+)}/g;
    const knownVariables = [
      "schema_file",
      "input_markdown",
      "input_markdown_file",
      "destination_path",
    ];
    const unknownVariables: string[] = [];

    let match;
    while ((match = variablePattern.exec(template)) !== null) {
      const variable = match[1];
      if (!knownVariables.includes(variable)) {
        unknownVariables.push(variable);
      }
    }

    return unknownVariables;
  }
}
