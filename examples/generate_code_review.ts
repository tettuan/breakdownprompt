/**
 * Generate Code Review Prompt Example
 *
 * This example demonstrates how to generate a code review prompt.
 * It shows how to create a structured review request with specific
 * files to review and output location for the review results.
 */

// For users: import from JSR
// import { PromptManager } from "@tettuan/breakdownprompt";

// For local development
import { PromptManager } from "../mod.ts";

async function main() {
  const manager = new PromptManager();

  // Define the code review parameters
  const template = "./examples/templates/code_review.md";
  const variables = {
    schema_file: "./examples/templates/schema/review.schema.json",
    input_text:
      "Please review the following code changes for:\n- Code quality\n- Performance impact\n- Security considerations",
    input_text_file: "./examples/templates/input/changes_to_review.ts",
    destination_path: "./examples/templates/review/output/",
  };

  try {
    // Generate the code review prompt
    const result = await manager.generatePrompt(template, variables);
    if (result.success) {
      console.log("Generated code review prompt:");
      console.log(result.content);
    } else {
      console.error("Error generating code review prompt:", result.error);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating code review prompt:", error.message);
    }
  }
}

if (import.meta.main) {
  main();
}
