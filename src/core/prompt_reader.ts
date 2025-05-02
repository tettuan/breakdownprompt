/**
 * PromptReader class
 *
 * Purpose:
 * - プロンプトファイルの読み込みと検証を行う
 * - ファイルの存在確認、権限確認、内容読み込みを提供する
 */

import { FileSystemError } from "../errors.ts";

export class PromptReader {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * ファイルの存在を確認する
   * @returns {Promise<boolean>} ファイルが存在する場合はtrue
   * @throws {FileSystemError} If permission is denied
   */
  async verifyFileExists(): Promise<boolean> {
    try {
      await Deno.stat(this.filePath);
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        return false;
      }
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new FileSystemError(`Permission denied: Cannot access file ${this.filePath}`);
      }
      throw error;
    }
  }

  /**
   * ファイルの読み取り権限を確認する
   * @returns {Promise<boolean>} 読み取り権限がある場合はtrue
   * @throws {FileSystemError} If permission is denied
   */
  async checkReadPermission(): Promise<boolean> {
    try {
      // Check if file is readable
      // Note: Deno.stat doesn't provide direct permission info
      // We attempt to open the file to verify read permission
      const file = await Deno.open(this.filePath, { read: true });
      file.close();
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new FileSystemError(`Permission denied: Cannot read file ${this.filePath}`);
      }
      throw error;
    }
  }

  /**
   * ファイルの内容を読み込む
   * @returns {Promise<string>} ファイルの内容
   * @throws {FileSystemError} If file cannot be read or permission is denied
   */
  async readFile(): Promise<string> {
    try {
      const content = await Deno.readTextFile(this.filePath);
      // Ensure content is not empty and preserve original formatting
      if (!content || content.trim() === "") {
        throw new FileSystemError(`File ${this.filePath} is empty`);
      }
      // Preserve original line endings and whitespace
      return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    } catch (error) {
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new FileSystemError(`Permission denied: Cannot read file ${this.filePath}`);
      }
      if (error instanceof Deno.errors.NotFound) {
        throw new FileSystemError(`File not found: ${this.filePath}`);
      }
      throw new FileSystemError(
        `Failed to read file ${this.filePath}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
