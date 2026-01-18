// routes/index.js 路由总入口
import { Hono } from 'hono';
import userRouter from './users.js';

const rootRouter = new Hono();
// 挂载所有子路由
rootRouter.route('/users', userRouter);
// rootRouter.route('/posts', postRouter);

export default rootRouter;