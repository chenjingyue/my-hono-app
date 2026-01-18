// src/utils/AppError.ts

import type {ContentfulStatusCode} from "hono/utils/http-status";

class AppError extends Error {
    statusCode: ContentfulStatusCode;
    status: 'fail' | 'error';
    isOperational: boolean;

    constructor(message: string, statusCode: ContentfulStatusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // 标记为可预期的业务错误
        this.name = this.constructor.name; // 日志中显示 [AppError]

        // 保留原始堆栈（排除构造函数本身）
        Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;