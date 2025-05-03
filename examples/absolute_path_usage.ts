/**
 * Absolute Path Usage Example
 *
 * This example demonstrates how to use paths with PromptParams
 * for both input and output parameters.
 */

import { PromptManager } from "../src/mod.ts";
import { PathValidator } from "../src/validation/path_validator.ts";
import { FileUtils } from "../src/utils/file_utils.ts";

// Initialize components
const _pathValidator = new PathValidator();
const _fileUtils = new FileUtils();
const promptManager = new PromptManager();

// Use relative path for template
const inputPath = "examples/templates/documentation.md";

async function main() {
  try {
    // Create prompt parameters
    const variables = {
      input_text: "Generate comprehensive documentation for the following code:\n- API endpoints\n- Function parameters\n- Return values\n- Usage examples",
      input_text_file: "examples/templates/input/code_to_document.ts",
      schema_file: "examples/templates/schema/docs.schema.json",
      destination_path: "examples/templates/docs/output/"
    };

    // Generate the prompt
    const result = await promptManager.generatePrompt(inputPath, variables);

    if (result.success) {
      console.log("Prompt generated successfully!");
      console.log(`Input file: ${inputPath}`);
      console.log("\nGenerated prompt:");
      console.log("----------------");
      console.log(result.prompt);
    } else {
      console.error("Failed to generate prompt:", result.error);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
  }
}

// Run the example
if (import.meta.main) {
  await main();
} 