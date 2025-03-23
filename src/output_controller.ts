/// <reference lib="deno.ns" />
import type { OutputResult } from "./types.ts";

export class OutputController {
  constructor(
    private destination: string,
    private multipleFiles: boolean,
    private structured: boolean,
  ) {}

  public async generateOutput(content: string): Promise<OutputResult> {
    try {
      await this.checkPermissions();
      const files = await this.writeContent(content);
      return {
        success: true,
        files,
      };
    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async checkPermissions(): Promise<void> {
    try {
      await Deno.stat(this.destination);
    } catch {
      // Directory doesn't exist, try to create it
      await Deno.mkdir(this.destination, { recursive: true });
    }
  }

  private async writeContent(content: string): Promise<string[]> {
    const files: string[] = [];
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    if (this.multipleFiles) {
      // Split content into multiple files based on headers
      const sections = content.split(/(?=^# )/m);

      for (const section of sections) {
        if (!section.trim()) continue;

        const headerMatch = section.match(/^# (.+)$/m);
        const filename = headerMatch
          ? `${timestamp}_${headerMatch[1].toLowerCase().replace(/\s+/g, "_")}.md`
          : `${timestamp}_section_${files.length + 1}.md`;

        const filepath = this.structured
          ? `${this.destination}/${filename}`
          : `${this.destination}/${filename}`;

        await Deno.writeTextFile(filepath, section.trim());
        files.push(filepath);
      }
    } else {
      const filename = `${timestamp}_prompt.md`;
      const filepath = `${this.destination}/${filename}`;
      await Deno.writeTextFile(filepath, content);
      files.push(filepath);
    }

    return files;
  }
}
