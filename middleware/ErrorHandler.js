const logger = require("../utils/logger");


const globalErrorHandler =  (err, c) => {
    // 设置默认值
    const statusCode = err.statusCode || 500;
    const message = err.message || '服务器异常';

    // ===== 📝 记录错误日志 =====
    const logMeta = {
        url: c.req.url,
        method: c.req.method,
        ip: c.req.header('x-forwarded-for') || 'unknown',
        userAgent: c.req.header('User-Agent'),
        timestamp: new Date().toISOString(),
        error: {
            message: err.message,
            statusCode: err.statusCode,
            stack: err.stack // 可选：是否打印堆栈，生产环境可以关闭
        },
    };

    if (err.isOperational) {
        // ✅ 业务错误：记录为 warn 级别（非紧急）
        logger.warn(logMeta);

        // 返回客户端
        return c.json({ status: 'fail', message }, statusCode)
    } else {
        // ❌ 程序错误（未捕获的 bug）：记录为 error 级别（需告警）
        logger.error(logMeta);

        // 返回客户端（不暴露细节）
        return c.json({ status: 'error', message: '服务器内部错误' }, 500)
    }
};

module.exports = globalErrorHandler;