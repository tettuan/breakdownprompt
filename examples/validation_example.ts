/**
 * Validation Example
 *
 * This example demonstrates:
 * - Variable validation
 * - Error handling for invalid inputs
 * - Path validation
 * - Markdown format validation
 */

import { PromptManager } from "@tettuan/breakdownprompt";

async function main() {
  const manager = new PromptManager();

  // Example with invalid paths and markdown
  const params = {
    prompt_file_path: "./examples/templates/validation_prompt.md",
    variables: {
      schema_file: "./non/existent/path/schema.json",
      input_markdown: "Invalid markdown without proper heading",
      input_markdown_file: "./non/existent/input.md",
      destination_path: "./examples/templates/task/output/"
    },
    validate() {
      // Custom validation logic
      const errors: string[] = [];
      
      // Check if schema file exists
      try {
        Deno.statSync(params.variables.schema_file);
      } catch {
        errors.push(`Schema file not found: ${params.variables.schema_file}`);
      }

      // Check if input markdown has proper heading
      if (!params.variables.input_markdown.includes("#")) {
        errors.push("Input markdown must start with a heading");
      }

      // Check if input file exists
      try {
        Deno.statSync(params.variables.input_markdown_file);
      } catch {
        errors.push(`Input file not found: ${params.variables.input_markdown_file}`);
      }

      if (errors.length > 0) {
        console.error("Validation errors:", errors);
        return false;
      }
      return true;
    }
  };

  try {
    const result = await manager.generatePrompt(params);
    console.log("Generated content:", result.content);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating prompt:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
  }
}

if (import.meta.main) {
  main();
} 