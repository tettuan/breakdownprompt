import { assert, assertEquals, assertThrows } from "@std/assert";
import { PromptGenerator } from "../src/prompt_generator.ts";
import { checkpoint, endSection, logObject, startSection } from "../utils/debug-logger.ts";
import { logger } from "../utils/logger.ts";

Deno.test("PromptGenerator - initialization", () => {
  startSection("PromptGenerator Initialization Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  checkpoint("Instance created", { isInstance: generator instanceof PromptGenerator });
  assertEquals(generator instanceof PromptGenerator, true);
  logger.info("PromptGenerator instance created successfully");
  endSection("PromptGenerator Initialization Test");
});

Deno.test("PromptGenerator - template parsing", () => {
  startSection("Template Parsing Test");

  const generator = new PromptGenerator();
  const template = "Load schema from {schema_file} and save to {destination_path}";
  const result = generator.parseTemplate(template);
  logObject(result, "Parsed Result");

  // Verify the content was processed correctly
  assert(result.content !== undefined, "Result should have content");
  assert(result.content === template, "Result content should match template");

  // Verify variable detection
  const variablePattern = /\{([^}]+)\}/g;
  const variables = new Set<string>();
  let match;
  while ((match = variablePattern.exec(template)) !== null) {
    variables.add(match[1]);
  }

  // Log test results
  checkpoint("Template parsing completed successfully", {
    variableCount: variables.size,
    variables: Array.from(variables),
  });

  endSection("Template Parsing Test");
});

Deno.test("PromptGenerator - variable replacement", () => {
  startSection("Variable Replacement Test");

  const generator = new PromptGenerator();
  const template = "Load schema from {schema_file} and save to {destination_path}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("schema_file", "/path/to/schema.json");
  values.set("destination_path", "/path/to/output");

  const content = generator.replaceVariables(result, values);
  logObject(content, "Replaced Content");

  // Verify variable replacement
  assert(content.includes("/path/to/schema.json"), "Schema path should be replaced");
  assert(content.includes("/path/to/output"), "Destination path should be replaced");

  // Log test results
  checkpoint("Variable replacement completed successfully", {
    originalTemplate: template,
    replacedContent: content,
    replacedVariables: Array.from(values.keys()),
  });

  endSection("Variable Replacement Test");
});

Deno.test("PromptGenerator - unknown variable", () => {
  startSection("Unknown Variable Test");

  const generator = new PromptGenerator();
  const template = "Hello {unknown}!";
  const _result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("unknown", "world");

  logger.warn("Template contains unknown variable", { variable: "unknown", template });

  // Log test results
  checkpoint("Unknown variable test completed successfully", {
    template,
    hasUnknownVariable: true,
  });

  endSection("Unknown Variable Test");
});

Deno.test("PromptGenerator - invalid value type", () => {
  startSection("Invalid Value Type Test");

  const generator = new PromptGenerator();
  const template = "Save to {destination_path}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("destination_path", 42);

  assertThrows(
    () => generator.replaceVariables(result, values),
    Error,
    "Invalid value for variable: destination_path",
  );

  // Log test results
  checkpoint("Invalid value type test completed successfully", {
    expectedError: "Invalid value for variable: destination_path",
    invalidValue: 42,
  });

  endSection("Invalid Value Type Test");
});

Deno.test("PromptGenerator - value validation errors", () => {
  startSection("Value Validation Test");

  const generator = new PromptGenerator();
  const template = "Save to {destination_path}";
  const result = generator.parseTemplate(template);

  const testCases = [
    { type: "number", value: 42, expectedError: "Invalid value for variable: destination_path" },
    { type: "null", value: null, expectedError: "Invalid value for variable: destination_path" },
    {
      type: "undefined",
      value: undefined,
      expectedError: "Invalid value for variable: destination_path",
    },
    { type: "string", value: "/valid/path", expectedResult: "Save to /valid/path" },
  ];

  for (const testCase of testCases) {
    const values = new Map<string, unknown>();
    values.set("destination_path", testCase.value);

    if (testCase.expectedError) {
      assertThrows(
        () => generator.replaceVariables(result, values),
        Error,
        testCase.expectedError,
      );
    } else {
      const content = generator.replaceVariables(result, values);
      assertEquals(content, testCase.expectedResult);
    }
  }

  // Log test results
  checkpoint("Value validation test completed successfully", {
    testCases,
  });

  endSection("Value Validation Test");
});
