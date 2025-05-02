/**
 * Parameters required for generating a prompt from a template.
 *
 * @interface PromptParams
 * @description
 * This interface defines the parameters needed to generate a prompt from a template.
 * It includes the template file path, variables for replacement, and optional debug settings.
 *
 * @property {string} template_file - Path to the template file. Must be a valid file path.
 * @property {Record<string, string>} variables - Variables to replace in the template.
 *   Each key represents a variable name, and its value is the replacement content.
 * @property {boolean} [debug] - Optional flag to enable debug logging during prompt generation.
 *
 * @example
 * ```typescript
 * const params: PromptParams = {
 *   template_file: "./templates/task.md",
 *   variables: {
 *     task_name: "Code Review",
 *     input_file: "./src/main.ts"
 *   },
 *   debug: true
 * };
 * ```
 */
export interface PromptParams {
  /** Path to the template file */
  template_file: string;
  /** Variables to replace in the template */
  variables: Record<string, string>;
  /** Optional flag to enable debug logging */
  debug?: boolean;
}
