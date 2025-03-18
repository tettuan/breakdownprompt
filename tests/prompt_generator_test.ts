import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { PromptGenerator } from "../src/prompt_generator.ts";
import { logger } from "../utils/logger.ts";

Deno.test("PromptGenerator - initialization", () => {
  const generator = new PromptGenerator();
  assertEquals(generator instanceof PromptGenerator, true);
});

Deno.test("PromptGenerator - template parsing", () => {
  const generator = new PromptGenerator();
  const template = "Load schema from {schema_file} and input from {input_markdown_file}";
  const result = generator.parseTemplate(template);

  assertEquals(result.content, template);
  assertEquals(result.metadata.variables.size, 2);
  assertEquals(result.metadata.variables.has("schema_file"), true);
  assertEquals(result.metadata.variables.has("input_markdown_file"), true);
});

Deno.test("PromptGenerator - variable replacement", () => {
  const generator = new PromptGenerator();
  const template = "Load schema from {schema_file} and save to {destination_path}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("schema_file", "/path/to/schema.json");
  values.set("destination_path", "/path/to/output");

  const content = generator.replaceVariables(result, values);
  assertEquals(content, "Load schema from /path/to/schema.json and save to /path/to/output");
});

Deno.test("PromptGenerator - unknown variable", () => {
  const generator = new PromptGenerator();
  const template = "Hello {unknown}!";
  
  // Should not throw error, just log info
  const result = generator.parseTemplate(template);
  assertEquals(result.content, template);
  assertEquals(result.metadata.variables.size, 1);
  assertEquals(result.metadata.variables.has("unknown"), true);
});

Deno.test("PromptGenerator - invalid value type", () => {
  const generator = new PromptGenerator();
  const template = "Save to {destination_path}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("destination_path", 42); // Number instead of string

  assertThrows(
    () => {
      generator.replaceVariables(result, values);
    },
    Error,
    "Invalid value for variable: destination_path"
  );
});

Deno.test("PromptGenerator - value validation errors", () => {
  const generator = new PromptGenerator();
  const template = "Save to {destination_path}";
  const result = generator.parseTemplate(template);

  // Test case 1: Invalid type (number instead of string)
  const values1 = new Map<string, unknown>();
  values1.set("destination_path", 42);
  assertThrows(
    () => {
      generator.replaceVariables(result, values1);
    },
    Error,
    "Invalid value for variable: destination_path"
  );

  // Test case 2: Invalid type (null)
  const values2 = new Map<string, unknown>();
  values2.set("destination_path", null);
  assertThrows(
    () => {
      generator.replaceVariables(result, values2);
    },
    Error,
    "Invalid value for variable: destination_path"
  );

  // Test case 3: Invalid type (undefined)
  const values3 = new Map<string, unknown>();
  values3.set("destination_path", undefined);
  assertThrows(
    () => {
      generator.replaceVariables(result, values3);
    },
    Error,
    "Invalid value for variable: destination_path"
  );

  // Test case 4: Valid value (string)
  const values4 = new Map<string, unknown>();
  values4.set("destination_path", "/valid/path");
  const content4 = generator.replaceVariables(result, values4);
  assertEquals(content4, "Save to /valid/path"); // Content should be replaced
}); 