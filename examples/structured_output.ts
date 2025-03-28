/**
 * Structured Output Example
 *
 * This example demonstrates how to use @tettuan/breakdownprompt to generate
 * prompts in a structured format. This is particularly useful when:
 * 1. You need to process the prompt content programmatically
 * 2. You want to maintain a specific data structure for the prompt
 * 3. You need to integrate with other systems that expect structured data
 *
 * The output will be both split into multiple files and structured,
 * providing both organization and programmatic access to the content.
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
    multipleFiles: true,
    structured: true, // Enable structured output
    validate() {
      return true;
    },
  };

  try {
    // Generate prompt
    const result = await manager.generatePrompt(params);
    console.log("Generated content:", result.content);
    console.log("Output is structured:", params.structured);
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
