/**
 * Parameters required for generating a prompt from a template.
 * @interface PromptParams
 */
export interface PromptParams {
  /** Path to the template file */
  template_file: string;
  /** Variables to replace in the template */
  variables: Record<string, string>;
  /** Optional flag to enable debug logging */
  debug?: boolean;
}
