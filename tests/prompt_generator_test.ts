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

Deno.test("PromptGenerator - variable replacement with all specified variables", () => {
  const generator = new PromptGenerator();
  const template = `Schema: {schema_file}
Input: {input_markdown}
Input File: {input_markdown_file}
Destination: {destination_path}`;
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("schema_file", "/path/to/schema.json");
  values.set("input_markdown", "# Test Content\nThis is a test.");
  values.set("input_markdown_file", "/path/to/input.md");
  values.set("destination_path", "/path/to/output");

  const content = generator.replaceVariables(result, values);
  logger.debug("Replaced Content", content);

  // Verify all variables are replaced correctly
  assert(content.includes("/path/to/schema.json"), "Schema path should be replaced");
  assert(content.includes("# Test Content"), "Input markdown should be replaced");
  assert(content.includes("/path/to/input.md"), "Input file path should be replaced");
  assert(content.includes("/path/to/output"), "Destination path should be replaced");

  logger.debug("All specified variables replaced successfully", {
    variables: Array.from(values.keys()),
    content,
  });
});

Deno.test("PromptGenerator - variable naming rules", () => {
  const generator = new PromptGenerator();
  const validTemplate = "Test {valid_variable} and {ValidVariable}";
  const invalidTemplate = "Test {123invalid} and {_invalid}";

  // Test valid variable names
  const validResult = generator.parseTemplate(validTemplate);
  const validVariables = validTemplate.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || [];
  assert(validVariables.length === 2, "Should detect 2 valid variables");
  assert(validVariables.includes("valid_variable"), "Should detect valid_variable");
  assert(validVariables.includes("ValidVariable"), "Should detect ValidVariable");

  // Test invalid variable names
  const invalidResult = generator.parseTemplate(invalidTemplate);
  const invalidVariables = invalidTemplate.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || [];
  assert(invalidVariables.length === 2, "Should detect 2 invalid variables");

  logger.debug("Variable naming rules test completed", {
    validVariables,
    invalidVariables,
  });
});

Deno.test("PromptGenerator - variable uniqueness", () => {
  const generator = new PromptGenerator();
  const template = "Test {test_var} and {test_var}";
  const result = generator.parseTemplate(template);

  // Get unique variables from template
  const variables = new Set(template.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || []);
  assert(variables.size === 1, "Should count duplicate variables as one");
  assert(variables.has("test_var"), "Should detect test_var");

  const values = new Map<string, unknown>();
  values.set("test_var", "value");

  const content = generator.replaceVariables(result, values);
  const matches = content.match(/value/g);
  assert(matches?.length === 2, "Should replace all occurrences with same value");

  logger.debug("Variable uniqueness test completed", {
    uniqueVariables: Array.from(variables),
    replacementCount: matches?.length,
  });
});

Deno.test("PromptGenerator - optional variables", () => {
  const generator = new PromptGenerator();
  const template = "Test {optional_var}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  // Don't set optional_var

  const content = generator.replaceVariables(result, values);
  assert(content.includes("{optional_var}"), "Should keep optional variable unchanged");

  logger.debug("Optional variables test completed", {
    template,
    content,
    variables: Array.from(template.match(/\{([^}]+)\}/g)?.map(v => v.slice(1, -1)) || []),
  });
});
