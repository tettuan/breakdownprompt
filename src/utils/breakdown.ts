/**
 * Utility functions for breaking down prompts into manageable sections.
 */

import { logger } from "../../utils/logger.ts";

/**
 * Breaks down a prompt into sections based on markdown headers.
 * @param content The prompt content to break down
 * @returns An array of sections
 */
export function breakdownByHeaders(content: string): string[] {
  return content.split(/(?=^#{1,6}\s)/m).filter(Boolean);
}

/**
 * Breaks down a prompt into sections based on a custom delimiter.
 * @param content The prompt content to break down
 * @param delimiter The delimiter to split on
 * @returns An array of sections
 */
export function breakdownByDelimiter(content: string, delimiter: string): string[] {
  return content.split(delimiter).filter(Boolean);
}

/**
 * Breaks down a prompt into sections based on line count.
 * @param content The prompt content to break down
 * @param maxLines Maximum number of lines per section
 * @returns An array of sections
 */
export function breakdownByLineCount(content: string, maxLines: number): string[] {
  const lines = content.split("\n");
  const sections: string[] = [];

  for (let i = 0; i < lines.length; i += maxLines) {
    sections.push(lines.slice(i, i + maxLines).join("\n"));
  }

  return sections;
}

export function splitIntoSection(content: string): string[] {
  logger.debug("Starting section split", { contentLength: content.length });

  const sections = content
    .split(/\n\s*\n(?=^#{1,6}\s)/m) // 空行 + 見出しで分割
    .map((section) => section.trim()) // 各セクションの前後の空白を除去
    .filter(Boolean); // 空のセクションを除去

  logger.debug("Section split completed", {
    sectionCount: sections.length,
    sections: sections.map((s) => ({
      header: s.split("\n")[0],
      length: s.length,
    })),
  });

  return sections;
}
