// src/logger/types.ts

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    log(level: LogLevel, message: unknown, meta?: Record<string, unknown>): void;
    info(message: unknown, meta?: Record<string, unknown>): void;
    warn(message: unknown, meta?: Record<string, unknown>): void;
    error(message: unknown, meta?: Record<string, unknown>): void;
    debug(message: unknown, meta?: Record<string, unknown>): void;
}