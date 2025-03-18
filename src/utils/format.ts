import { join } from "jsr:@std/path@1";

/**
 * Utility functions for formatting prompts and outputs.
 */

/**
 * Formats a prompt section as markdown.
 * @param content The content to format
 * @returns Formatted markdown string
 */
export function formatAsMarkdown(content: string): string {
  return content.trim() + "\n";
}

/**
 * Formats a prompt section as structured data.
 * @param content The content to format
 * @param format The format to use (json, yaml, etc.)
 * @returns Formatted string in the specified format
 */
export function formatAsStructured(content: string, format: "json" | "yaml" = "json"): string {
  const sections = content.split(/(?=^#{1,6}\s)/m).filter(Boolean);
  const structured: Record<string, string> = {};

  for (const section of sections) {
    const match = section.match(/^#{1,6}\s+(.+?)\n([\s\S]*?)$/);
    if (match) {
      structured[match[1].toLowerCase()] = match[2].trim();
    }
  }

  return format === "json"
    ? JSON.stringify(structured, null, 2)
    : Object.entries(structured)
        .map(([key, value]) => `${key}:\n  ${value.replace(/\n/g, "\n  ")}`)
        .join("\n");
}

/**
 * Formats a filename based on content type and timestamp.
 * @param prefix The prefix for the filename
 * @param extension The file extension
 * @param directory Optional directory path
 * @returns Formatted filename with full path
 */
export function formatFilename(prefix: string, extension = "md", directory?: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `${prefix}_${timestamp}.${extension}`;
  return directory ? join(directory, filename) : filename;
} 