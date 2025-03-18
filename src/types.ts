/**
 * Configuration options for the prompt manager.
 */
export interface Config {
  cacheSize: number;
  timeout: number;
  validate(): boolean;
}

/**
 * Parameters for prompt generation.
 */
export interface PromptParams {
  demonstrativeType: string;
  layerType: string;
  fromLayerType: string;
  destination: string;
  multipleFiles: boolean;
  structured: boolean;
  validate(): boolean;
}

export interface VariableReplacer {
  replace(value: unknown): string;
  validate(value: unknown): boolean;
}

export interface OutputResult {
  success: boolean;
  files: string[];
  error?: string;
}

/**
 * Result of prompt generation.
 */
export interface PromptResult {
  content: string;
  metadata: {
    template: string;
    variables: Map<string, string>;
    timestamp: Date;
  };
} 