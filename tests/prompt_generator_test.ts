/**
 * Prompt Generator Tests
 *
 * Purpose:
 * - Verify template parsing and variable detection
 * - Test variable replacement functionality
 * - Validate error handling and edge cases
 *
 * Background:
 * These tests ensure the PromptGenerator works as specified in docs/index.ja.md
 * and follows the design patterns in docs/design_pattern.ja.md.
 */

import { assert, assertEquals, assertThrows } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import { PromptGenerator } from "../src/prompt_generator.ts";
import { TemplateError, ValidationError } from "../src/errors.ts";
import { cleanupTestDirs, setupTestDirs } from "./test_utils.ts";

const logger = new BreakdownLogger();

Deno.test("Prompt Generator", async (t) => {
  await setupTestDirs();

  await t.step("should parse template with variables", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old!";
    const variables = { name: "John", age: "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should detect unknown variables", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old!";
    const variables = { name: "John" };
    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "Missing required variable: age",
    );
  });

  await t.step("should replace variables", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old!";
    const variables = { name: "John", age: "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle missing variables", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old.";
    const variables = {
      name: "John",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "Missing required variable: age",
    );
  });

  await t.step("should handle null or undefined values", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}!";
    const variables = { name: null };
    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "Invalid value for variable: name",
    );
  });

  await t.step("should handle empty template", () => {
    const generator = new PromptGenerator();
    assertThrows(
      () => generator.parseTemplate("", {}),
      TemplateError,
      "Template cannot be empty",
    );
  });

  await t.step("should handle whitespace-only template", () => {
    const generator = new PromptGenerator();
    assertThrows(
      () => generator.parseTemplate("   \n  \t  \n  ", {}),
      TemplateError,
      "Template cannot be empty",
    );
  });

  await t.step("should handle multiple occurrences of the same variable", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}! How are you {name}?";
    const variables = { name: "John" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John! How are you John?");
  });

  await t.step("should handle variables with spaces", () => {
    const generator = new PromptGenerator();
    const template = "Hello {user name}, you are {user age} years old!";
    const variables = { "user name": "John", "user age": "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with special characters", () => {
    const generator = new PromptGenerator();
    const template = "Hello {user.name}, you are {user-age} years old!";
    const variables = { "user.name": "John", "user-age": "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with numbers", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name1}, you are {age2} years old!";
    const variables = { name1: "John", age2: "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with mixed case", () => {
    const generator = new PromptGenerator();
    const template = "Hello {UserName}, you are {AGE} years old!";
    const variables = { UserName: "John", AGE: "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with underscores", () => {
    const generator = new PromptGenerator();
    const template = "Hello {user_name}, you are {user_age} years old!";
    const variables = { user_name: "John", user_age: "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with hyphens", () => {
    const generator = new PromptGenerator();
    const template = "Hello {user-name}, you are {user-age} years old!";
    const variables = { "user-name": "John", "user-age": "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with dots", () => {
    const generator = new PromptGenerator();
    const template = "Hello {user.name}, you are {user.age} years old!";
    const variables = { "user.name": "John", "user.age": "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should handle variables with brackets", () => {
    const generator = new PromptGenerator();
    const template = "Hello {user[name]}, you are {user[age]} years old!";
    const variables = { "user[name]": "John", "user[age]": "30" };
    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old!");
  });

  await t.step("should replace variables in template", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old.";
    const variables = {
      name: "John",
      age: "30",
    };

    const result = generator.parseTemplate(template, variables);
    assertEquals(result.content, "Hello John, you are 30 years old.");
    assertEquals(result.variables, []);
    assertEquals(result.unknownVariables, []);
  });

  await t.step("should handle invalid variable values", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old.";
    const variables = {
      name: 123,
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "name must be a string",
    );
  });

  await t.step("should handle null variable values", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old.";
    const variables = {
      name: null,
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "name must be a string",
    );
  });

  await t.step("should handle invalid variable names", () => {
    const generator = new PromptGenerator();
    const template = "Hello {123invalid}, you are {age} years old.";
    const variables = {
      "123invalid": "John",
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "Invalid variable name: 123invalid",
    );
  });

  await t.step("should handle empty template", () => {
    const generator = new PromptGenerator();
    const template = "";
    const variables = {
      name: "John",
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      TemplateError,
      "Template cannot be empty",
    );
  });

  await t.step("should handle whitespace template", () => {
    const generator = new PromptGenerator();
    const template = "   \n  \t  \n  ";
    const variables = {
      name: "John",
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      TemplateError,
      "Template cannot be empty",
    );
  });

  await t.step("should handle boolean variable values", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old.";
    const variables = {
      name: true,
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "name must be a string",
    );
  });

  await t.step("should handle number variable values", () => {
    const generator = new PromptGenerator();
    const template = "Hello {name}, you are {age} years old.";
    const variables = {
      name: 42,
      age: "30",
    };

    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "name must be a string",
    );
  });

  await t.step("should detect variables in template", () => {
    const generator = new PromptGenerator();
    const template =
      "Schema: {schema_file}\nInput: {input_markdown}\nFile: {input_markdown_file}\nOutput: {destination_path}";
    const variables = {
      schema_file: "/path/to/schema.json",
      input_markdown: "# Sample Markdown",
      input_markdown_file: "/path/to/input.md",
      destination_path: "/path/to/output",
    };
    const result = generator.parseTemplate(template, variables);
    assert(result.variables !== undefined, "Variables should be defined");
    assert(result.variables.includes("schema_file"), "Should detect schema_file variable");
    assert(result.variables.includes("input_markdown"), "Should detect input_markdown variable");
    assert(
      result.variables.includes("input_markdown_file"),
      "Should detect input_markdown_file variable",
    );
    assert(
      result.variables.includes("destination_path"),
      "Should detect destination_path variable",
    );
    assert(result.variables.length === 4, "Should detect all variables");
  });

  await t.step("should handle variable replacement", () => {
    const generator = new PromptGenerator();
    const template =
      "Schema: {schema_file}\nInput: {input_markdown}\nFile: {input_markdown_file}\nOutput: {destination_path}";
    const variables = {
      schema_file: "/path/to/schema.json",
      input_markdown: "# Sample Markdown",
      input_markdown_file: "/path/to/input.md",
      destination_path: "/path/to/output",
    };
    const result = generator.parseTemplate(template, variables);
    assert(result.content !== undefined, "Content should be defined");
    assert(result.content.includes("/path/to/schema.json"), "Should replace schema_file");
    assert(
      result.content.includes("# Sample Markdown"),
      "Should replace input_markdown",
    );
    assert(result.content.includes("/path/to/input.md"), "Should replace input_markdown_file");
    assert(result.content.includes("/path/to/output"), "Should replace destination_path");
  });

  await t.step("should handle variable validation", () => {
    const generator = new PromptGenerator();
    const template =
      "Schema: {schema_file}\nInput: {input_markdown}\nFile: {input_markdown_file}\nOutput: {destination_path}";
    const variables = {
      schema_file: "/path/to/schema.json",
      input_markdown: "# Sample Markdown",
      input_markdown_file: "/path/to/input.md",
      destination_path: "/path/to/output",
    };
    const result = generator.parseTemplate(template, variables);
    assert(result.content !== undefined, "Content should be defined");
    assert(result.content.includes("/path/to/schema.json"), "Should replace schema_file");
    assert(
      result.content.includes("# Sample Markdown"),
      "Should replace input_markdown",
    );
    assert(
      result.content.includes("/path/to/input.md"),
      "Should replace input_markdown_file",
    );
    assert(result.content.includes("/path/to/output"), "Should replace destination_path");
  });

  await t.step("should handle empty template", () => {
    const generator = new PromptGenerator();
    const template = "";
    const variables = {};
    assertThrows(
      () => generator.parseTemplate(template, variables),
      ValidationError,
      "Template is empty",
    );
  });

  await t.step("should handle variable names", () => {
    const generator = new PromptGenerator();
    const template =
      "Valid: {valid_variable} {validVariable} {valid-variable} {valid.variable} {valid_variable_123} {validVariable123} {valid-variable-123} {valid.variable.123}";
    const variables = {
      valid_variable: "value",
      validVariable: "value",
      "valid-variable": "value",
      "valid.variable": "value",
      valid_variable_123: "value",
      validVariable123: "value",
      "valid-variable-123": "value",
      "valid.variable.123": "value",
    };
    const result = generator.parseTemplate(template, variables);
    assert(result.variables !== undefined, "Variables should be defined");
    assert(result.variables.includes("valid_variable"), "Should accept underscore");
    assert(result.variables.includes("validVariable"), "Should accept camelCase");
    assert(result.variables.includes("valid-variable"), "Should accept hyphen");
    assert(result.variables.includes("valid.variable"), "Should accept dot");
    assert(result.variables.includes("valid_variable_123"), "Should accept numbers");
    assert(result.variables.includes("validVariable123"), "Should accept numbers in camelCase");
    assert(result.variables.includes("valid-variable-123"), "Should accept numbers with hyphen");
    assert(result.variables.includes("valid.variable.123"), "Should accept numbers with dot");
  });

  await cleanupTestDirs();
});

Deno.test("PromptGenerator - initialization", () => {
  const generator = new PromptGenerator();
  assertEquals(generator instanceof PromptGenerator, true);
});

Deno.test("PromptGenerator - template parsing", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}!";
  const variables = { name: "John" };
  const result = generator.parseTemplate(template, variables);
  assertEquals(result.content, "Hello John!");
});

Deno.test("PromptGenerator - variable replacement", () => {
  logger.info("Starting variable replacement test");

  const generator = new PromptGenerator();
  const template = `
# Sample Template

## Schema
{schema_file}

## Input
{input_markdown}

## Input File
{input_markdown_file}

## Output
{destination_path}
`;

  const variables = {
    schema_file: "/path/to/schema.json",
    input_markdown: "# Sample Markdown\nThis is a sample markdown content.",
    input_markdown_file: "/path/to/input.md",
    destination_path: "/path/to/output",
  };

  const result = generator.parseTemplate(template, variables);
  assert(result.content !== undefined, "Content should be defined");
  if (result.content) {
    assert(result.content.includes("/path/to/schema.json"), "Should replace schema_file");
    assert(
      result.content.includes("# Sample Markdown\nThis is a sample markdown content."),
      "Should replace input_markdown",
    );
    assert(result.content.includes("/path/to/input.md"), "Should replace input_markdown_file");
    assert(result.content.includes("/path/to/output"), "Should replace destination_path");
  }

  logger.info("Variable replacement test completed");
});

Deno.test("PromptGenerator - unknown variable", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}!";
  const variables = { username: "John" };
  assertThrows(
    () => generator.parseTemplate(template, variables),
    ValidationError,
    "Missing required variable: name",
  );
});

Deno.test("PromptGenerator - invalid value type", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}!";
  const variables = { name: 123 };
  assertThrows(
    () => generator.parseTemplate(template, variables),
    ValidationError,
    "Invalid value for variable: name",
  );
});

Deno.test("PromptGenerator - value validation errors", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}!";
  const variables = { name: null };
  assertThrows(
    () => generator.parseTemplate(template, variables),
    ValidationError,
    "Invalid value for variable: name",
  );
});

Deno.test("PromptGenerator - variable replacement with all specified variables", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, you are {age} years old!";
  const variables = { name: "John", age: "30" };
  const result = generator.parseTemplate(template, variables);
  assertEquals(result.content, "Hello John, you are 30 years old!");
});

Deno.test("PromptGenerator - variable naming rules", () => {
  const generator = new PromptGenerator();
  const template = "Hello {123invalid}!";
  const variables = { "123invalid": "John" };
  assertThrows(
    () => generator.parseTemplate(template, variables),
    ValidationError,
    "Invalid variable name: 123invalid",
  );
});

Deno.test("PromptGenerator - variable uniqueness", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}! Hi {name}!";
  const variables = { name: "John" };
  const result = generator.parseTemplate(template, variables);
  assertEquals(result.content, "Hello John! Hi John!");
});

Deno.test("PromptGenerator - optional variables", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}!";
  const variables = { name: "John", age: "30" };
  const result = generator.parseTemplate(template, variables);
  assertEquals(result.content, "Hello John!");
});

Deno.test("Prompt Generator - basic variable replacement", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, you are {age} years old.";
  const variables = {
    name: "John",
    age: "30",
  };

  const result = generator.parseTemplate(template, variables);
  assertEquals(result.content, "Hello John, you are 30 years old.");
});

Deno.test("Prompt Generator - invalid variable values", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, you are {age} years old.";
  const variables = {
    name: 123,
    age: "30",
  };

  assertThrows(
    () => {
      generator.parseTemplate(template, variables);
    },
    ValidationError,
    "Invalid value for variable: name",
  );
});

Deno.test("Prompt Generator - empty template", () => {
  const generator = new PromptGenerator();
  const template = "";
  const variables = {
    name: "John",
    age: "30",
  };

  assertThrows(
    () => {
      generator.parseTemplate(template, variables);
    },
    TemplateError,
    "Template cannot be empty",
  );
});

Deno.test("Prompt Generator - whitespace template", () => {
  const generator = new PromptGenerator();
  const template = "   \n  \t  \n  ";
  const variables = {
    name: "John",
    age: "30",
  };

  assertThrows(
    () => {
      generator.parseTemplate(template, variables);
    },
    TemplateError,
    "Template cannot be empty",
  );
});

Deno.test("Prompt Generator - boolean variable values", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, you are {age} years old.";
  const variables = {
    name: true,
    age: "30",
  };

  assertThrows(
    () => {
      generator.parseTemplate(template, variables);
    },
    ValidationError,
    "Invalid value for variable: name",
  );
});

Deno.test("Prompt Generator - number variable values", () => {
  const generator = new PromptGenerator();
  const template = "Hello {name}, you are {age} years old.";
  const variables = {
    name: 42,
    age: "30",
  };

  assertThrows(
    () => {
      generator.parseTemplate(template, variables);
    },
    ValidationError,
    "Invalid value for variable: name",
  );
});

// Test template parsing
Deno.test("Prompt Generator - template parsing", () => {
  logger.info("Starting template parsing test");
  const generator = new PromptGenerator();
  const template =
    "Schema: {schema_file}\nInput: {input_markdown_file}\nOutput: {destination_path}";
  const variables = {
    schema_file: "/path/to/schema.json",
    input_markdown_file: "/path/to/input.md",
    destination_path: "/path/to/output",
  };
  const result = generator.parseTemplate(template, variables);
  assert(result.variables.includes("schema_file"), "Should include schema_file");
  assert(
    result.variables.includes("input_markdown_file"),
    "Should include input_markdown_file",
  );
  assert(
    result.variables.includes("destination_path"),
    "Should include destination_path",
  );
  assertEquals(
    result.content,
    "Schema: /path/to/schema.json\nInput: /path/to/input.md\nOutput: /path/to/output",
  );
});

// Test partial variable replacement
Deno.test("Prompt Generator - partial variable replacement", () => {
  logger.info("Starting partial variable replacement test");
  const generator = new PromptGenerator();
  const template =
    "Schema: {schema_file}\nInput: {input_markdown_file}\nOutput: {destination_path}";
  const variables = {
    schema_file: "/path/to/schema.json",
    input_markdown_file: "/path/to/input.md",
    destination_path: "/path/to/output",
    extra_var: "unused",
  };
  const result = generator.parseTemplate(template, variables);
  assert(result.variables.includes("schema_file"), "Should include schema_file");
  assert(
    result.variables.includes("input_markdown_file"),
    "Should include input_markdown_file",
  );
  assert(
    result.variables.includes("destination_path"),
    "Should include destination_path",
  );
  assertEquals(
    result.content,
    "Schema: /path/to/schema.json\nInput: /path/to/input.md\nOutput: /path/to/output",
  );
  logger.info("Partial variable replacement test completed");
});

// Test invalid variable names
Deno.test("Prompt Generator - invalid variable names", () => {
  logger.info("Starting invalid variable names test");
  const generator = new PromptGenerator();
  const template = "Invalid: {invalid-name}\nAlso invalid: {123number}";
  const variables = {
    "invalid-name": "value1",
    "123number": "value2",
  };
  assertThrows(
    () => generator.parseTemplate(template, variables),
    ValidationError,
    "Invalid variable name: invalid-name",
  );
  logger.info("Invalid variable names test completed");
});

// Test variable name validation
Deno.test("Prompt Generator - variable name validation", () => {
  logger.info("Starting variable name validation test");
  const generator = new PromptGenerator();
  const template = "Valid: {valid_name}\nAlso valid: {validName123}";
  const variables = {
    valid_name: "value1",
    validName123: "value2",
  };
  const result = generator.parseTemplate(template, variables);
  assert(result.variables.includes("valid_name"), "Should include valid_name");
  assert(result.variables.includes("validName123"), "Should include validName123");
  assertEquals(result.content, "Valid: value1\nAlso valid: value2");
  logger.info("Variable name validation test completed");
});
