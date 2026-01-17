// src/utils/log-core.ts

// 定义日志实现接口
export interface LoggerImplementation {
    log(level: 'info' | 'warn' | 'error' | 'debug', message: any, meta?: Record<string, any>): void;
}

let _impl: LoggerImplementation | null = null;

/**
 * 设置实际的日志实现（例如 winston、pino、console 等）
 */
export function setLoggerImpl(impl: LoggerImplementation): void {
    _impl = impl;
}

/**
 * 内部通用日志方法
 */
function log(level: 'info' | 'warn' | 'error' | 'debug', message: any, meta: Record<string, any> = {}): void {
    if (!_impl) {
        // 降级：使用 console
        console[level](`[UNINITIALIZED LOG] ${message}`, meta);
        return;
    }
    _impl.log(level, message, meta);
}

/**
 * 导出统一的 logger 接口
 */
export const logger = {
    info: (msg: any, meta?: Record<string, any>) => log('info', msg, meta),
    warn: (msg: any, meta?: Record<string, any>) => log('warn', msg, meta),
    error: (msg: any, meta?: Record<string, any>) => log('error', msg, meta),
    debug: (msg: any, meta?: Record<string, any>) => log('debug', msg, meta),
};