// src/logger/core.ts
import { Logger } from './types.js';

let currentLogger: Logger | null = null;

export function setLogger(logger: Logger): void {
    currentLogger = logger;
}

function ensureLogger(): Logger {
    if (!currentLogger) {
        throw new Error('Logger not initialized! Call setLogger() first.');
        // 或者降级到 console（根据需求）
    }
    return currentLogger;
}

export const logger: Logger = {
    log(level, message, meta) {
        ensureLogger().log(level, message, meta);
    },
    info(msg, meta) { ensureLogger().info(msg, meta); },
    warn(msg, meta) { ensureLogger().warn(msg, meta); },
    error(msg, meta) { ensureLogger().error(msg, meta); },
    debug(msg, meta) { ensureLogger().debug(msg, meta); }
};