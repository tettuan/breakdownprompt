/**
 * Basic Usage Example
 *
 * This example demonstrates the fundamental usage of @tettuan/breakdownprompt.
 * It shows how to:
 * 1. Initialize the PromptManager
 * 2. Configure basic parameters for prompt generation
 * 3. Generate a single prompt output
 *
 * This is the simplest form of usage, where the prompt is generated
 * into a single file without any special structuring or splitting.
 */

import { PromptManager } from "@tettuan/breakdownprompt";

async function main() {
  // Initialize PromptManager
  const manager = new PromptManager();

  // Define prompt parameters
  const params = {
    prompt_file_path: "./examples/templates/basic_prompt.md",
    destination: "./output",
    multipleFiles: false,
    structured: false,
    validate() {
      return true;
    },
  };

  try {
    // Generate prompt
    const result = await manager.generatePrompt(params);
    console.log("Generated prompt:", result.content);
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
