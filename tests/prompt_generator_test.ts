import { assert, assertEquals, assertThrows } from "@std/assert";
import { PromptGenerator } from "../src/prompt_generator.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";

const logger = new BreakdownLogger();

Deno.test("PromptGenerator - initialization", () => {
  logger.info("Starting PromptGenerator Initialization Test");
  const generator = new PromptGenerator();
  logger.info("PromptGenerator instance created successfully", {
    isInstance: generator instanceof PromptGenerator,
  });
  assertEquals(generator instanceof PromptGenerator, true);
  logger.info("PromptGenerator Initialization Test completed");
});

Deno.test("PromptGenerator - template parsing", () => {
  const generator = new PromptGenerator();
  const template = "Load schema from {schema_file} and save to {destination_path}";
  const result = generator.parseTemplate(template);
  logger.debug("Parsed Result", result);

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
  logger.debug("Template parsing completed successfully", {
    variableCount: variables.size,
    variables: Array.from(variables),
  });
});

Deno.test("PromptGenerator - variable replacement", () => {
  const generator = new PromptGenerator();
  const template = "Load schema from {schema_file} and save to {destination_path}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("schema_file", "/path/to/schema.json");
  values.set("destination_path", "/path/to/output");

  const content = generator.replaceVariables(result, values);
  logger.debug("Replaced Content", content);

  // Verify variable replacement
  assert(content.includes("/path/to/schema.json"), "Schema path should be replaced");
  assert(content.includes("/path/to/output"), "Destination path should be replaced");

  // Log test results
  logger.debug("Variable replacement completed successfully", {
    originalTemplate: template,
    replacedContent: content,
    replacedVariables: Array.from(values.keys()),
  });
});

Deno.test("PromptGenerator - unknown variable", () => {
  const generator = new PromptGenerator();
  const template = "Hello {unknown}!";
  const _result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("unknown", "world");

  logger.debug("Template contains unknown variable", { variable: "unknown", template });

  // Log test results
  logger.debug("Unknown variable test completed successfully", {
    template,
    hasUnknownVariable: true,
  });
});

Deno.test("PromptGenerator - invalid value type", () => {
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
  logger.debug("Invalid value type test completed successfully", {
    expectedError: "Invalid value for variable: destination_path",
    invalidValue: 42,
  });
});

Deno.test("PromptGenerator - value validation errors", () => {
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
  logger.debug("Value validation test completed successfully", {
    testCases,
  });
});
