import { assertEquals, assertThrows } from "std/testing/asserts.ts";
import { PromptGenerator } from "../src/prompt_generator.ts";
import { startSection, endSection, checkpoint, logObject } from "../utils/debug-logger.ts";

Deno.test("PromptGenerator - initialization", () => {
  startSection("PromptGenerator Initialization Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  checkpoint("Instance created", { isInstance: generator instanceof PromptGenerator });
  assertEquals(generator instanceof PromptGenerator, true);
  endSection("PromptGenerator Initialization Test");
});

Deno.test("PromptGenerator - template parsing", () => {
  startSection("Template Parsing Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  
  const template = "Load schema from {schema_file} and input from {input_markdown_file}";
  checkpoint("Template to parse", { template });
  
  const result = generator.parseTemplate(template);
  checkpoint("Parse result", { 
    content: result.content,
    variables: Array.from(result.metadata.variables.keys())
  });

  assertEquals(result.content, template);
  assertEquals(result.metadata.variables.size, 2);
  assertEquals(result.metadata.variables.has("schema_file"), true);
  assertEquals(result.metadata.variables.has("input_markdown_file"), true);
  endSection("Template Parsing Test");
});

Deno.test("PromptGenerator - variable replacement", () => {
  startSection("Variable Replacement Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  
  const template = "Load schema from {schema_file} and save to {destination_path}";
  checkpoint("Template to process", { template });
  
  const result = generator.parseTemplate(template);
  checkpoint("Initial parse result", { 
    content: result.content,
    variables: Array.from(result.metadata.variables.keys())
  });

  const values = new Map<string, unknown>();
  values.set("schema_file", "/path/to/schema.json");
  values.set("destination_path", "/path/to/output");
  checkpoint("Replacement values", { values: Object.fromEntries(values) });

  const content = generator.replaceVariables(result, values);
  checkpoint("Final content after replacement", { content });
  
  assertEquals(content, "Load schema from /path/to/schema.json and save to /path/to/output");
  endSection("Variable Replacement Test");
});

Deno.test("PromptGenerator - unknown variable", () => {
  startSection("Unknown Variable Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  
  const template = "Hello {unknown}!";
  checkpoint("Template with unknown variable", { template });
  
  const result = generator.parseTemplate(template);
  checkpoint("Parse result", { 
    content: result.content,
    variables: Array.from(result.metadata.variables.keys())
  });
  
  assertEquals(result.content, template);
  assertEquals(result.metadata.variables.size, 1);
  assertEquals(result.metadata.variables.has("unknown"), true);
  endSection("Unknown Variable Test");
});

Deno.test("PromptGenerator - invalid value type", () => {
  startSection("Invalid Value Type Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  
  const template = "Save to {destination_path}";
  checkpoint("Template to process", { template });
  
  const result = generator.parseTemplate(template);
  checkpoint("Initial parse result", { 
    content: result.content,
    variables: Array.from(result.metadata.variables.keys())
  });

  const values = new Map<string, unknown>();
  values.set("destination_path", 42);
  checkpoint("Invalid value", { value: values.get("destination_path") });

  assertThrows(
    () => {
      checkpoint("Attempting variable replacement with invalid value", {});
      generator.replaceVariables(result, values);
    },
    Error,
    "Invalid value for variable: destination_path"
  );
  endSection("Invalid Value Type Test");
});

Deno.test("PromptGenerator - value validation errors", () => {
  startSection("Value Validation Test");
  checkpoint("Creating new PromptGenerator instance", {});
  const generator = new PromptGenerator();
  
  const template = "Save to {destination_path}";
  checkpoint("Template to process", { template });
  
  const result = generator.parseTemplate(template);
  checkpoint("Initial parse result", { 
    content: result.content,
    variables: Array.from(result.metadata.variables.keys())
  });

  // Test case 1: Invalid type (number instead of string)
  const values1 = new Map<string, unknown>();
  values1.set("destination_path", 42);
  checkpoint("Test case 1: Invalid number value", { value: values1.get("destination_path") });
  
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
  checkpoint("Test case 2: Invalid null value", { value: values2.get("destination_path") });
  
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
  checkpoint("Test case 3: Invalid undefined value", { value: values3.get("destination_path") });
  
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
  checkpoint("Test case 4: Valid string value", { value: values4.get("destination_path") });
  
  const content4 = generator.replaceVariables(result, values4);
  checkpoint("Final content after valid replacement", { content: content4 });
  
  assertEquals(content4, "Save to /valid/path");
  endSection("Value Validation Test");
}); 