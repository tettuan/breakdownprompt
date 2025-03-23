/**
 * Utility functions for breaking down prompts into manageable sections.
 */

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
  return content
    .split("\n")
    .filter((line) => line.trim() !== "") // 空行を除去
    .join("\n")
    .split(/(?=## )/); // 見出しで分割
}
