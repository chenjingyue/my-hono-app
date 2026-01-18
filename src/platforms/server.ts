// src/platforms/server.ts
import { config } from 'dotenv';
import app from '../app/app.js'; // 注意：TS 中导入编译后的 .js
import { serve } from '@hono/node-server';
import { setLogger } from '../logger/core.js';
import { NodeLogger } from '../logger/adapters/node-logger.js';
import { setDB } from '../db/ts/factory.js';
import { SQLiteDatabaseAdapter } from '../db/ts/sqlite-adapter.js';

// 加载环境变量
config();

// 设置默认 NODE_ENV
if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'dev';
}

// 初始化日志器（Node 版本）
setLogger(new NodeLogger());

// 初始化 SQLite 数据库（仅用于本地开发）
const sqLiteDatabaseAdapter = await SQLiteDatabaseAdapter.create();
setDB(sqLiteDatabaseAdapter);

const PORT = parseInt(process.env.PORT || '9990', 10);

serve(
    {
        fetch: app.fetch,
        port: PORT,
    },
    () => {
        console.log(
            `✅ Hono服务启动成功 → http://localhost:${PORT}，当前环境：${process.env.NODE_ENV}`
        );
    }
);