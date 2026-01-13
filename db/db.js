// utils/db.js - 最终完整版 无坑+高性能+全兼容+自动容错
const isCloudflare = typeof process.env.CF_PAGES !== 'undefined' || typeof process.env.CF_WORKERS !== 'undefined';
let localDb = null;

// 初始化本地SQLite：全局单例，项目启动只执行一次
if (!isCloudflare) {
    const fs = require('fs');
    const path = require('path');
    const dbDir = path.join(__dirname, '..', 'db');
    // 自动创建db目录，防止文件找不到报错
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir);
    }
    // 引入并创建全局唯一的数据库实例
    const betterSqlite3 = require('better-sqlite3');
    localDb = betterSqlite3(path.join(dbDir, 'database.db'));
    // 开启高性能WAL模式，必加优化
    localDb.pragma('journal_mode = WAL');
    // 开启外键约束（如果你的表用到外键，必加）
    localDb.pragma('foreign_keys = ON');
}

// 统一获取数据库实例：本地=SQLite单例，CF=D1绑定实例
const getDB = (c) => {
    // CF环境：返回D1数据库实例
    if (isCloudflare) {
        return c.env.MY_DATABASE;
    }
    // 本地环境：返回封装后的SQLite实例（异步兼容D1）
    return {
        prepare: (sql) => ({
            bind: (...params) => ({
                // 查询单条 → 对应 better-sqlite3 的 get()
                first: () => Promise.resolve(localDb.prepare(sql).get(...params)),
                // 查询多条 → 对应 better-sqlite3 的 all()
                all: () => Promise.resolve(localDb.prepare(sql).all(...params)),
                // 增删改 → 对应 better-sqlite3 的 run()，透传所有返回值
                run: () => Promise.resolve(localDb.prepare(sql).run(...params))
            })
        }),
        // 兼容D1的顶层事务方法
        transaction: (fn) => Promise.resolve(localDb.transaction(fn)())
    };
};

module.exports = { getDB };