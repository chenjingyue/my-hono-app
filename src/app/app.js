// 引入核心依赖
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import rootRouter from '../routes/index.js';
import {getBjDateTime} from "../utils/time.js";
import globalErrorHandler from "../middleware/ErrorHandler.ts"; // Hono内置跨域中间件


// 创建Hono实例，等价于Express的 const app = express()
const app = new Hono();



// ===================== 全局中间件 =====================
// 1. 跨域配置 - 解决前端请求跨域问题，必备
app.use('*', cors({
  origin: '*', // 允许所有域名访问，生产环境可指定具体域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// 2. 请求日志中间件 - 打印请求信息+北京时间，方便调试
app.use('*', async (c, next) => {
  const startTime = getBjDateTime();
  const { method, url } = c.req;
  console.log(`[${startTime}] ${method} -> ${url}`);
  await next(); // 执行后续路由
});

// 3. 解析JSON请求体 - Hono内置，无需额外安装，等价于express.json()
app.use('*', async (c, next) => {
  if (c.req.header('Content-Type') === 'application/json') {
    c.req.body = await c.req.json().catch(() => ({}));
  }
  await next();
});

// ===== 路由 =====
app.route('/api', rootRouter);

// ===== 全局错误处理 =====
app.onError(globalErrorHandler);

export default app;