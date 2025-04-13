/**
 * Basic Usage Example
 *
 * This example demonstrates the core functionality of @tettuan/breakdownprompt:
 * - Loading a prompt file
 * - Replacing variables with provided values
 * - Basic error handling
 */

import { PromptManager } from "@tettuan/breakdownprompt";

async function main() {
  // Initialize PromptManager
  const manager = new PromptManager();

  // Define prompt parameters with required variables
  const template = "./examples/templates/basic_prompt.md";
  const variables = {
    schema_file: "./examples/templates/schema/base.schema.json",
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: "./examples/templates/input/sample.md",
    destination_path: "./examples/templates/task/output/"
  };

  try {
    // Generate prompt
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
