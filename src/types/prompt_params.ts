export interface PromptParams {
  template_file: string;
  variables: Record<string, string>;
  debug?: boolean;
}
