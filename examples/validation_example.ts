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
  const template = "./examples/templates/validation_prompt.md";
  const variables = {
    schema_file: "./non/existent/path/schema.json",
    input_markdown: "Invalid markdown without proper heading",
    input_markdown_file: "./non/existent/input.md",
    destination_path: "./examples/templates/task/output/"
  };

  try {
    const result = await manager.generatePrompt(template, variables);
    console.log("Generated content:", result.prompt);
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