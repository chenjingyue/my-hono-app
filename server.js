
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const app = require("./app");
const { serve } = require('@hono/node-server');

const PORT = process.env.PORT || 9990;

serve({
    fetch: app.fetch,
    port: PORT
}, () => {
    console.log(`✅ Hono服务启动成功 → http://localhost:${PORT}，当前环境：${process.env.NODE_ENV}`);
});

// ===================== Cloudflare部署必备 =====================
// 导出fetch函数，CF会自动识别，无需修改，本地运行不受影响
module.exports = { fetch: app.fetch };