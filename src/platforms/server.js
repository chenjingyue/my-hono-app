// src/platforms/server.js
import { config } from 'dotenv';

import app from "../app/app.js";
import { serve } from '@hono/node-server';
import { setLoggerImpl } from '../utils/log-core.js';
import { createNodeLogger } from '../utils/log-node.js';
// import { setDB } from '../db/index.js';
// import { getDB } from '../db/sqlite.js';
import { setDB } from '../db/ts/factory.js';
import {SQLiteDatabaseAdapter} from '../db/ts/sqlite-adapter.js';

config();
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// 初始化日志器（Node 版本）
setLoggerImpl(createNodeLogger());
// 初始化数据库
const sqLiteDatabaseAdapter = await SQLiteDatabaseAdapter.create();
setDB(sqLiteDatabaseAdapter);

const PORT = process.env.PORT || 9990;

serve({
    fetch: app.fetch,
    port: PORT
}, () => {
    console.log(`✅ Hono服务启动成功 → http://localhost:${PORT}，当前环境：${process.env.NODE_ENV}`);
});

