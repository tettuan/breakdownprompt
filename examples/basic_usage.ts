/**
 * Basic Usage Example
 *
 * This example demonstrates the core functionality of @tettuan/breakdownprompt:
 * - Loading a prompt file
 * - Replacing variables with provided values
 * - Basic error handling
 */

// For users: import from JSR
// import { PromptManager } from "@tettuan/breakdownprompt";

// For local development
import { PromptManager } from "../mod.ts";

async function main() {
  // Initialize PromptManager
  const manager = new PromptManager();

  // Define prompt parameters with required variables
  const template = "./examples/templates/basic_prompt.md";
  const variables = {
    input_text: "This is a sample input text for the basic prompt.",
    schema_file: "./examples/templates/schema/base.schema.json",
    input_text_file: "./examples/templates/input/sample.txt",
    destination_path: "./examples/templates/output/"
  };

  try {
    // Generate prompt
    const result = await manager.generatePrompt(template, variables);
    if (result.success) {
      console.log("Generated content:");
      console.log(result.prompt);
    } else {
      console.error("Error generating prompt:", result.error);
    }
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
