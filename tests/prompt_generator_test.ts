import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { PromptGenerator } from "../src/prompt_generator.ts";

Deno.test("PromptGenerator - initialization", () => {
  const generator = new PromptGenerator();
  assertEquals(generator instanceof PromptGenerator, true);
});

Deno.test("PromptGenerator - template parsing", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, welcome to {project}!";
  const result = generator.parseTemplate(template);

  assertEquals(result.content, template);
  assertEquals(result.metadata.variables.size, 2);
  assertEquals(result.metadata.variables.has("name"), true);
  assertEquals(result.metadata.variables.has("project"), true);
});

Deno.test("PromptGenerator - variable replacement", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, welcome to {project}!";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("name", "John");
  values.set("project", "Deno");

  const content = generator.replaceVariables(result, values);
  assertEquals(content, "Hello John, welcome to Deno!");
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
  const template = "Count: {count}";
  const result = generator.parseTemplate(template);

  const values = new Map<string, unknown>();
  values.set("count", 42); // Number instead of string

  assertThrows(
    () => {
      generator.replaceVariables(result, values);
    },
    Error,
    "Invalid value for variable: count",
  );
}); 