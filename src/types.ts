export interface Config {
  cacheSize: number;
  timeout: number;
  validate(): boolean;
}

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

export interface PromptResult {
  content: string;
  metadata: {
    template: string;
    variables: Map<string, string>;
    timestamp: Date;
  };
} 