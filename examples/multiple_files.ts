/**
 * Multiple Files Output Example
 *
 * This example demonstrates how to use @tettuan/breakdownprompt to generate
 * prompts that are split into multiple files. This is useful when:
 * 1. You need to organize complex prompts into separate files
 * 2. You want to maintain better separation of concerns
 * 3. You need to process different parts of the prompt independently
 *
 * The output will be split into multiple files based on the template structure,
 * making it easier to manage and maintain large prompts.
 */

import { PromptManager } from "@tettuan/breakdownprompt";

async function main() {
  // Initialize template directory
  const manager = new PromptManager("./examples/templates");

  // Define prompt parameters
  const params = {
    demonstrativeType: "task",
    layerType: "implementation",
    fromLayerType: "design",
    destination: "./output",
    multipleFiles: true, // Enable multiple files output
    structured: false,
    validate() {
      return true;
    },
  };

  try {
    // Generate prompt
    const result = await manager.generatePrompt(params);
    console.log("Generated content:", result.content);
    console.log("Output is split into multiple files:", params.multipleFiles);
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
