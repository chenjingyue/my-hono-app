// src/logger/adapters/cf-logger.ts
import { Logger } from '../types.js';
import { formatLogLine } from '../formatters/bj-formatter.js';

export class CfLogger implements Logger {
    log(level: string, message: unknown, meta: Record<string, unknown> = {}) {
        const formatted = formatLogLine(level, message, meta);
        if (level === 'error' || level === 'warn') {
            console.error(formatted);
        } else {
            console.log(formatted);
        }
    }

    info(msg: unknown, meta?: Record<string, unknown>) { this.log('info', msg, meta); }
    warn(msg: unknown, meta?: Record<string, unknown>) { this.log('warn', msg, meta); }
    error(msg: unknown, meta?: Record<string, unknown>) { this.log('error', msg, meta); }
    debug(msg: unknown, meta?: Record<string, unknown>) { this.log('debug', msg, meta); }
}