import { Config } from "./types.ts";

export class DefaultConfig implements Config {
  constructor(
    public cacheSize: number = 100,
    public timeout: number = 5000,
  ) {}

  validate(): boolean {
    if (this.cacheSize <= 0) {
      throw new Error("Cache size must be positive");
    }
    if (this.timeout <= 0) {
      throw new Error("Timeout must be positive");
    }
    return true;
  }
} 