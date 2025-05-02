import { beforeEach, describe, it } from "https://deno.land/std@0.208.0/testing/bdd.ts";
import { assertEquals, assertExists } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { PromptManager } from "./prompt_manager.ts";

describe("PromptManager", () => {
  let promptManager: PromptManager;

  beforeEach(() => {
    promptManager = new PromptManager();
  });

  describe("generatePrompt", () => {
    it("should generate prompt with variables replaced", async () => {
      const templatePath = "./test/fixtures/template.txt";
      const variables = {
        name: "John",
        age: "30",
        city: "Tokyo",
      };

      const result = await promptManager.generatePrompt(templatePath, variables);

      assertEquals(result.success, true);
      if (result.success) {
        assertExists(result.prompt);
        assertEquals(result.prompt.includes("John"), true);
        assertEquals(result.prompt.includes("30"), true);
        assertEquals(result.prompt.includes("Tokyo"), true);
      }
    });

    it("should handle both {{variable}} and {variable} syntax", async () => {
      const templatePath = "./test/fixtures/mixed_syntax.txt";
      const variables = {
        name: "John",
        age: "30",
      };

      const result = await promptManager.generatePrompt(templatePath, variables);

      assertEquals(result.success, true);
      if (result.success) {
        assertExists(result.prompt);
        assertEquals(result.prompt.includes("John"), true);
        assertEquals(result.prompt.includes("30"), true);
      }
    });

    it("should return unknown variables", async () => {
      const templatePath = "./test/fixtures/template.txt";
      const variables = {
        name: "John",
      };

      const result = await promptManager.generatePrompt(templatePath, variables);

      assertEquals(result.success, true);
      if (result.success) {
        assertExists(result.unknownVariables);
        assertEquals(result.unknownVariables.includes("age"), true);
        assertEquals(result.unknownVariables.includes("city"), true);
      }
    });

    it("should validate file paths in variables", async () => {
      const templatePath = "./test/fixtures/template.txt";
      const variables = {
        name: "John",
        file_path: "../secret.txt",
      };

      const result = await promptManager.generatePrompt(templatePath, variables);

      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(result.error.includes("directory traversal"), true);
      }
    });

    it("should handle variables with hyphens in names", async () => {
      const templatePath = "./test/fixtures/template.txt";
      const variables = {
        "user-name": "John",
      };

      const result = await promptManager.generatePrompt(templatePath, variables);

      assertEquals(result.success, false);
      if (!result.success) {
        assertEquals(result.error.includes("Invalid variable name"), true);
      }
    });
  });
});
