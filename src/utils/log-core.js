// src/utils/log-core.js
let _impl = null;

export function setLoggerImpl(impl) {
    _impl = impl;
}

function log(level, message, meta = {}) {
    if (!_impl) {
        // 降级：直接 console（防止未初始化）
        console[level](`[UNINITIALIZED LOG] ${message}`, meta);
        return;
    }
    _impl.log(level, message, meta);
}

export const logger = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
};