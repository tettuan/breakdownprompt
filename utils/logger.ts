// ログレベルの定義
export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  TRACE = "trace",
}

// 環境変数からログレベルを取得
const getLogLevel = (): LogLevel => {
  const envLevel = Deno.env.get("LOG_LEVEL")?.toLowerCase();
  if (!envLevel) return LogLevel.INFO;

  // 文字列からLogLevelを取得
  const level = Object.values(LogLevel).find((l) => l === envLevel);
  return level || LogLevel.INFO;
};

// 現在のログレベル
const currentLevel = getLogLevel();

// ログレベルの優先順位
const levelPriority: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
  [LogLevel.TRACE]: 4,
};

// ロガー関数
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (levelPriority[currentLevel] >= levelPriority[LogLevel.ERROR]) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (levelPriority[currentLevel] >= levelPriority[LogLevel.WARN]) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (levelPriority[currentLevel] >= levelPriority[LogLevel.INFO]) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  debug: (message: string, ...args: unknown[]) => {
    if (levelPriority[currentLevel] >= levelPriority[LogLevel.DEBUG]) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  trace: (message: string, ...args: unknown[]) => {
    if (levelPriority[currentLevel] >= levelPriority[LogLevel.TRACE]) {
      console.log(`[TRACE] ${message}`, ...args);
    }
  },
};
