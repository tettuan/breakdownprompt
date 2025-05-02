/**
 * PromptReader class
 *
 * Purpose:
 * - プロンプトファイルの読み込みと検証を行う
 * - ファイルの存在確認、権限確認、内容読み込みを提供する
 */

import { ValidationError } from "../errors.ts";
import { PermissionErrorMessages } from "../errors/permission_errors.ts";

export class PromptReader {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * ファイルの存在を確認する
   * @returns {Promise<boolean>} ファイルが存在する場合はtrue
   * @throws {ValidationError} If permission is denied
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
        throw new ValidationError(
          `${PermissionErrorMessages.ACCESS_FILE}: Cannot access file at ${this.filePath} - check file permissions and ownership`,
        );
      }
      throw error;
    }
  }

  /**
   * ファイルの読み取り権限を確認する
   * @returns {Promise<boolean>} 読み取り権限がある場合はtrue
   * @throws {ValidationError} If permission is denied
   */
  async checkReadPermission(): Promise<boolean> {
    try {
      await Deno.readFile(this.filePath);
      return true;
    } catch (error) {
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new ValidationError(
          `${PermissionErrorMessages.READ_FILE}: Cannot read file at ${this.filePath} - check read permissions`,
        );
      }
      throw error;
    }
  }

  /**
   * ファイルの内容を読み込む
   * @returns {Promise<string>} ファイルの内容
   * @throws {ValidationError} If file cannot be read or permission is denied
   */
  async readFile(): Promise<string> {
    try {
      return await Deno.readTextFile(this.filePath);
    } catch (error) {
      if (error instanceof Deno.errors.PermissionDenied) {
        throw new ValidationError(
          `${PermissionErrorMessages.READ_FILE}: Cannot read file at ${this.filePath} - check read permissions`,
        );
      }
      throw error;
    }
  }
}
