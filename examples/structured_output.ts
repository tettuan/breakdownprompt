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