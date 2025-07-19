/**
 * Generate Documentation Example
 *
 * This example demonstrates how to generate documentation from code.
 * It shows how to create a documentation request with specific
 * code files to document and output location for the generated docs.
 */

// For users: import from JSR
// import { PromptManager } from "@tettuan/breakdownprompt";

// For local development
import { PromptManager } from "../mod.ts";

async function main() {
  const manager = new PromptManager();

  // Define the documentation parameters
  const template = "./examples/templates/documentation.md";
  const variables = {
    schema_file: "./examples/templates/schema/docs.schema.json",
    input_text:
      "Generate comprehensive documentation for the following code:\n- API endpoints\n- Function parameters\n- Return values\n- Usage examples",
    input_text_file: "./examples/templates/input/code_to_document.ts",
    destination_path: "./examples/templates/docs/output/",
  };

  try {
    // Generate the documentation prompt
    const result = await manager.generatePrompt(template, variables);
    if (result.success) {
      console.log("Generated documentation prompt:");
      console.log(result.content);
    } else {
      console.error("Error generating documentation prompt:", result.error);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating documentation prompt:", error.message);
    }
  }
}

if (import.meta.main) {
  main();
}
