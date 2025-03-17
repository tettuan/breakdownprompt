import { VariableReplacer } from "../types.ts";

export class DestinationPathReplacer implements VariableReplacer {
  replace(value: unknown): string {
    if (typeof value !== "string") {
      throw new Error("Destination path must be a string");
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