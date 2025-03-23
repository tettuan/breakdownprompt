import type { VariableReplacer } from "../types.ts";

export class InputMarkdownReplacer implements VariableReplacer {
  replace(value: unknown): string {
    if (typeof value !== "string") {
      throw new Error("Input markdown content must be a string");
    }
    return value;
  }

  validate(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }
    return true;
  }
}
