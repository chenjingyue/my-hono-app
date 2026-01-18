// src/middlewares/global-error-handler.ts

import { Context } from 'hono';
import { logger } from '../logger/core.js';
import  AppError from '../utils/AppError.js';



// 错误处理中间件
const globalErrorHandler = (err: Error | AppError, c: Context) => {
    // 设置默认值
    const statusCode = (err instanceof AppError) ? err.statusCode : 500;
    const message = err.message || '服务器异常';

    // ===== 📝 记录错误日志 =====
    const logMeta = {
        url: c.req.url,
        method: c.req.method,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('User-Agent') || 'unknown',
        timestamp: new Date().toISOString(),
        error: {
            message: message,
            statusCode: statusCode,
            stack: err.stack, // 生产环境可考虑过滤
        },
    };

    if (err instanceof AppError && err.isOperational) {
        // ✅ 业务错误：记录为 warn 级别（非紧急）
        logger.warn(logMeta);

        // 返回客户端
        return c.json({ status: 'fail', message }, statusCode );
    } else {
        // ❌ 程序错误（未捕获的 bug）：记录为 error 级别（需告警）
        logger.error(logMeta);

        // 返回客户端（不暴露细节）
        return c.json({ status: 'error', message: '服务器内部错误' }, 500);
    }
};

export default globalErrorHandler;