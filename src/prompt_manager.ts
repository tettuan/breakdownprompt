import type { PromptParams, PromptResult } from "./types.ts";
import { PromptGenerator } from "./prompt_generator.ts";
import { OutputController } from "./output_controller.ts";

export class PromptManager {
  private templateCache: Map<string, string>;
  private readonly CACHE_SIZE = 100;

  constructor(
    private baseDir: string,
  ) {
    this.templateCache = new Map();
  }

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
    const cacheKey = `${params.demonstrativeType}/${params.layerType}/${params.fromLayerType}`;

    if (this.templateCache.has(cacheKey)) {
      const cachedTemplate = this.templateCache.get(cacheKey);
      if (!cachedTemplate) {
        throw new Error("Cache inconsistency detected");
      }
      return cachedTemplate;
    }

    const templatePath =
      `${this.baseDir}/${params.demonstrativeType}/${params.layerType}/f_${params.fromLayerType}.md`;

    try {
      const template = await Deno.readTextFile(templatePath);
      if (this.templateCache.size >= this.CACHE_SIZE) {
        // Remove oldest entry
        const firstKey = this.templateCache.keys().next().value;
        if (firstKey !== undefined) {
          this.templateCache.delete(firstKey);
        }
      }
      this.templateCache.set(cacheKey, template);
      return template;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load template: ${error.message}`);
      }
      throw new Error("Failed to load template: Unknown error");
    }
  }
}
