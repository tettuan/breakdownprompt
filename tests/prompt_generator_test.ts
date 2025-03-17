import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { PromptGenerator } from "../src/prompt_generator.ts";

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
  
  assertThrows(
    () => {
      generator.parseTemplate(template);
    },
    Error,
    "Unknown variable: unknown",
  );
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
    "Invalid value for variable: destination_path",
  );
}); 