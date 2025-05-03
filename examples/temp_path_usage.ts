/**
 * Temporary Path Usage Example
 *
 * This example demonstrates how to use Deno.makeTempDir() for handling
 * temporary files with absolute paths in BreakdownParams.
 */

import { PromptManager } from "../src/mod.ts";
import { FileUtils } from "../src/utils/file_utils.ts";
import { TextValidator } from "../src/validation/markdown_validator.ts";
import type { PromptGenerationResult } from "../src/types/prompt_result.ts";
import { PathValidator } from "../src/validation/path_validator.ts";
import { resolve } from "@std/path";

// Initialize validators and utilities
const textValidator = new TextValidator();
const fileUtils = new FileUtils();
const pathValidator = new PathValidator();
const promptManager = new PromptManager(textValidator, pathValidator);

async function main() {
  try {
    // Create a temporary directory in the system temp directory
    const tempDir = resolve(await Deno.makeTempDir({
      prefix: "breakdown_",
      dir: "/tmp"
    }));

    // Add the temporary directory as an allowed prefix
    pathValidator.addAllowedPrefix(tempDir);

    // Define paths using the temporary directory
    const inputPath = `${tempDir}/input_template.md`;
    const outputPath = `${tempDir}/output_result.md`;

    // Create a sample input file in the temp directory
    const sampleContent = `# Sample Documentation
This is a test template for demonstrating temporary file handling.
Variables:
- {title}
- {content}
`;
    await Deno.writeTextFile(inputPath, sampleContent);

    // Generate the prompt
    const result: PromptGenerationResult = await promptManager.generatePrompt(
      inputPath,
      {
        title: "Temporary File Example",
        content: "This is a test content for temporary file handling"
      }
    );

    if (result.success) {
      // Write the result to the output file
      await fileUtils.writeFile(outputPath, result.prompt);

      console.log("Prompt generated successfully!");
      console.log(`Temporary directory: ${tempDir}`);
      console.log(`Input file: ${inputPath}`);
      console.log(`Output file: ${outputPath}`);

      // Cleanup: Remove temporary files
      await Deno.remove(inputPath);
      await Deno.remove(outputPath);
      await Deno.remove(tempDir);

      console.log("Temporary files cleaned up successfully!");
    } else {
      console.error("Failed to generate prompt:", result.error);
    }
  } catch (error: unknown) {
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