// routes/index.js 路由总入口
const { Hono } = require('hono');
const userRouter = require('./users');
// 后续新增路由直接在这里引入即可，比如 const postRouter = require('./posts')

const rootRouter = new Hono();
// 挂载所有子路由
rootRouter.route('/users', userRouter);
// rootRouter.route('/posts', postRouter);

module.exports = rootRouter;