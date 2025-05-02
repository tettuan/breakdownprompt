/**
 * Generate Task Prompt Example
 *
 * This example demonstrates how to generate a task prompt from a template.
 * It shows a common use case where you need to create a task description
 * with specific input files and output locations.
 */

// For users: import from JSR
// import { PromptManager } from "@tettuan/breakdownprompt";

// For local development
import { PromptManager } from "../mod.ts";

async function main() {
  const manager = new PromptManager();

  // Define the task parameters
  const template = "./examples/templates/task_prompt.md";
  const variables = {
    schema_file: "./examples/templates/schema/task.schema.json",
    input_text: "Analyze the following code and suggest improvements",
    input_text_file: "./examples/templates/input/code_to_analyze.ts",
    destination_path: "./examples/templates/task/output/"
  };

  try {
    // Generate the task prompt
    const result = await manager.generatePrompt(template, variables);
    if (result.success) {
      console.log("Generated task prompt:");
      console.log(result.prompt);
    } else {
      console.error("Error generating task prompt:", result.error);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating task prompt:", error.message);
    }
  }
}

if (import.meta.main) {
  main();
} 