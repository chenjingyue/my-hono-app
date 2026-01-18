// src/logger/formatters/bj-formatter.ts
import { getBjDateTimeWithMs } from '../../utils/time.js';

interface ErrorMessageLike {
    message?: string;
    stack?: string;
}

export function formatMessage(message: unknown): { logMsg: string; stack: string } {
    let logMsg = '';
    let stack = '';

    if (typeof message === 'string') {
        logMsg = message;
    } else if (message instanceof Error) {
        logMsg = message.message;
        stack = message.stack || '';
    } else if (message !== null && typeof message === 'object') {
        const obj = message as Record<string, any>;
        logMsg = obj?.error?.message;
        stack = obj?.error?.stack || '';
    } else {
        logMsg = JSON.stringify(message, null, 2);
    }

    return { logMsg, stack };
}

export function formatMeta(meta: Record<string, unknown>): string {
    if (!meta || Object.keys(meta).length === 0) return '';
    try {
        return ' ' + JSON.stringify(meta, null, 2);
    } catch {
        return ' [Meta serialization failed]';
    }
}

export function formatLogLine(level: string, message: unknown, meta: Record<string, unknown> = {}): string {
    const { logMsg, stack } = formatMessage(message);
    const metaPart = formatMeta(meta);
    const timestamp = getBjDateTimeWithMs();
    let line = `${timestamp} [${level.toUpperCase()}]: ${logMsg}${metaPart}`;
    if (stack) line += `\n${stack}`;
    return line;
}