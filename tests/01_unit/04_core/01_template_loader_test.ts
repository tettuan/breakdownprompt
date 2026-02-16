/**
 * TemplateLoader Unit Test
 *
 * Purpose:
 * - Verify isFilePath() decision logic
 * - Verify load() file path and inline branches
 * - Test error handling for empty, permission, and unexpected errors
 */

import { assertEquals, assertRejects } from "@std/assert";
import { TemplateLoader } from "../../../src/core/template_loader.ts";
import { ValidationError } from "../../../src/errors.ts";
import { BreakdownLogger } from "@tettuan/breakdownlogger";
import type { PathValidator } from "../../../src/validation/path_validator.ts";
import type { FileUtils } from "../../../src/utils/file_utils.ts";

const logger = new BreakdownLogger("prompt");

function createMockPathValidator(
  overrides: Partial<PathValidator> = {},
): PathValidator {
  return {
    validateFilePath: (_path: string) => Promise.resolve(_path),
    validateDirectoryPath: (_path: string) => Promise.resolve(_path),
    addAllowedPrefix: (_prefix: string) => {},
    ...overrides,
  } as PathValidator;
}

function createMockFileUtils(
  overrides: Partial<FileUtils> = {},
): FileUtils {
  return {
    readFile: (_path: string) => Promise.resolve("mock content"),
    writeFile: (_path: string, _content: string) => Promise.resolve(),
    exists: (_path: string) => Promise.resolve(true),
    directoryExists: (_path: string) => Promise.resolve(true),
    normalizePath: (path: string) => path,
    joinPaths: (...paths: string[]) => paths.join("/"),
    getDirname: (path: string) => path.split("/").slice(0, -1).join("/"),
    ...overrides,
  } as FileUtils;
}

// --- isFilePath ---

Deno.test("isFilePath - path with slash returns true", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  assertEquals(loader.isFilePath("path/to/t.md"), true);
});

Deno.test("isFilePath - relative ./ returns true", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  assertEquals(loader.isFilePath("./template.md"), true);
});

Deno.test("isFilePath - absolute /tmp/ returns true", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  assertEquals(loader.isFilePath("/tmp/template.md"), true);
});

Deno.test("isFilePath - inline content returns false", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  assertEquals(loader.isFilePath("Hello {name}!"), false);
});

Deno.test("isFilePath - empty string returns false", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  assertEquals(loader.isFilePath(""), false);
});

Deno.test("isFilePath - braces only returns false", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  assertEquals(loader.isFilePath("{variable_name}"), false);
});

Deno.test("isFilePath - content with slash returns true (known limitation)", () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  // isFilePath uses input.includes("/") which misidentifies slashed content
  assertEquals(loader.isFilePath("content with / slash"), true);
});

// --- load() file path branch ---

Deno.test("load - loads file content (happy path)", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils({
      readFile: (_path: string) => Promise.resolve("Hello {name}!"),
    }),
    logger,
  );
  const result = await loader.load("path/to/template.md");
  assertEquals(result.content, "Hello {name}!");
  assertEquals(result.templatePath, "path/to/template.md");
});

Deno.test("load - returns original path as templatePath", async () => {
  const inputPath = "some/dir/my_template.md";
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils({
      readFile: (_path: string) => Promise.resolve("content here"),
    }),
    logger,
  );
  const result = await loader.load(inputPath);
  assertEquals(result.templatePath, inputPath);
});

Deno.test("load - throws for empty file content", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils({
      readFile: (_path: string) => Promise.resolve(""),
    }),
    logger,
  );
  await assertRejects(
    () => loader.load("path/to/empty.md"),
    ValidationError,
    "Template is empty",
  );
});

Deno.test("load - throws for whitespace-only file content", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils({
      readFile: (_path: string) => Promise.resolve("  \n  "),
    }),
    logger,
  );
  await assertRejects(
    () => loader.load("path/to/ws.md"),
    ValidationError,
    "Template is empty",
  );
});

Deno.test("load - re-throws pathValidator ValidationError", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator({
      validateFilePath: (_path: string) =>
        Promise.reject(new ValidationError("Path contains directory traversal (..)")),
    }),
    createMockFileUtils(),
    logger,
  );
  await assertRejects(
    () => loader.load("path/../evil.md"),
    ValidationError,
    "Path contains directory traversal",
  );
});

Deno.test("load - wraps PermissionDenied as ValidationError", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils({
      readFile: (_path: string) => Promise.reject(new Deno.errors.PermissionDenied("no access")),
    }),
    logger,
  );
  await assertRejects(
    () => loader.load("path/to/secret.md"),
    ValidationError,
    "Read permission denied",
  );
});

Deno.test("load - re-throws unexpected errors", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils({
      readFile: (_path: string) => Promise.reject(new Error("disk failure")),
    }),
    logger,
  );
  await assertRejects(
    () => loader.load("path/to/broken.md"),
    Error,
    "disk failure",
  );
});

Deno.test("load - does not call pathValidator for inline content", async () => {
  let pathValidatorCalled = false;
  const loader = new TemplateLoader(
    createMockPathValidator({
      validateFilePath: (_path: string) => {
        pathValidatorCalled = true;
        return Promise.resolve(_path);
      },
    }),
    createMockFileUtils(),
    logger,
  );
  await loader.load("Hello {name}!");
  assertEquals(pathValidatorCalled, false);
});

// --- load() inline branch ---

Deno.test("load - inline returns content with 'inline' path", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  const result = await loader.load("Hello {name}!");
  assertEquals(result.templatePath, "inline");
});

Deno.test("load - inline content is unchanged", async () => {
  const input = "Hello {name}! Welcome to {place}.";
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  const result = await loader.load(input);
  assertEquals(result.content, input);
});

Deno.test("load - inline throws for empty string", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  await assertRejects(
    () => loader.load(""),
    ValidationError,
    "Template is empty",
  );
});

Deno.test("load - inline throws for whitespace-only", async () => {
  const loader = new TemplateLoader(
    createMockPathValidator(),
    createMockFileUtils(),
    logger,
  );
  await assertRejects(
    () => loader.load("  \t  "),
    ValidationError,
    "Template is empty",
  );
});
