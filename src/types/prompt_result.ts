export interface PromptResult {
  success: boolean;
  prompt?: string;
  error?: string;
  content?: string;
  variables?: string[];
  unknownVariables?: string[];
}
