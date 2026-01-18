// src/app/app.ts
import {Hono} from 'hono';
import {cors} from 'hono/cors';
import rootRouter from '../routes/index.js';
import {getBjDateTime} from '../utils/time.js';
import globalErrorHandler from '../middleware/ErrorHandler.js';

// 创建 Hono 实例
const app = new Hono();

// ===================== 全局中间件 =====================

// 1. 跨域配置
app.use(
    '*',
    cors({
        origin: '*', // 生产环境建议指定域名
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
    })
);

// 2. 请求日志中间件（带北京时间）
app.use('*', async (c, next) => {
    const startTime = getBjDateTime();
    const {method} = c.req;
    const url = c.req.url; // 或用 c.req.path 获取路径部分
    console.log(`[${startTime}] ${method} -> ${url}`);
    await next();
});


// ===== 路由注册 =====
app.route('/api', rootRouter);

// ===== 全局错误处理 =====
// Hono 的 onError 接受 (err, c) => Response | Promise<Response>
app.onError((err, c) => {
    return globalErrorHandler(err, c); // 确保 globalErrorHandler 返回 Response
});

export default app;