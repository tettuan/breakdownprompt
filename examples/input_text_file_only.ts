import { PromptManager } from "../src/core/prompt_manager.ts";
import { FileUtils } from "../src/utils/file_utils.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { TextValidator } from "../src/validation/markdown_validator.ts";
import { PathValidator } from "../src/validation/path_validator.ts";
import { VariableValidator } from "../src/validation/variable_validator.ts";

const _logger = new BreakdownLogger();
const _fileUtils = new FileUtils();
const textValidator = new TextValidator();
const pathValidator = new PathValidator();
const variableValidator = new VariableValidator();
const promptManager = new PromptManager(textValidator, pathValidator, variableValidator);

async function main() {
  try {
    // テンプレートと変数を設定
    const templatePath = "./examples/templates/basic_prompt.md";
    const variables = {
      schema_file: "./examples/templates/schema/base.schema.json",
      input_text_file: "./examples/templates/input/sample.txt",
      destination_path: "./examples/templates/output/",
    };

    // プロンプトを生成
    const result = await promptManager.generatePrompt(templatePath, variables);
    if (result.success) {
      console.log("Generated content:");
      console.log(result.content);
      console.log("\nVariables found in template:");
      console.log(result.variables);
      console.log("\nUnknown variables (will be kept as is):");
      console.log(result.variables.remaining);
    } else {
      console.error("Error:", result.error);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

main();
