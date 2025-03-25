import type { PromptParams, PromptResult } from "./types.ts";
import { PromptGenerator } from "./prompt_generator.ts";
import { OutputController } from "./output_controller.ts";

export class PromptManager {
  constructor(
    private baseDir: string,
  ) {}

  public async generatePrompt(params: PromptParams): Promise<PromptResult> {
    this.validateParams(params);
    const template = await this.loadTemplate(params);
    const generator = new PromptGenerator();
    const result = generator.parseTemplate(template);

    const values = new Map<string, unknown>();
    // Add values based on params
    values.set("schema_file", `${this.baseDir}/schema/${params.layerType}.json`);
    values.set("input_markdown_file", `${this.baseDir}/input/${params.fromLayerType}.md`);
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

    return {
      content,
      metadata: {
        template,
        variables: result.metadata.variables,
        timestamp: new Date(),
      },
    };
  }

  private validateParams(params: PromptParams): void {
    if (!params.demonstrativeType) {
      throw new Error("Demonstrative type is required");
    }
    if (!params.layerType) {
      throw new Error("Layer type is required");
    }
    if (!params.fromLayerType) {
      throw new Error("From layer type is required");
    }
    if (!params.destination) {
      throw new Error("Destination is required");
    }
  }

  private async loadTemplate(params: PromptParams): Promise<string> {
    const templatePath =
      `${this.baseDir}/${params.demonstrativeType}/${params.layerType}/f_${params.fromLayerType}.md`;

    try {
      return await Deno.readTextFile(templatePath);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load template: ${error.message}`);
      }
      throw new Error("Failed to load template: Unknown error");
    }
  }
}
