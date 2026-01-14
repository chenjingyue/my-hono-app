// src/db/index.js

import AppError from "../utils/AppError.js";

let sqliteInstance = null;

export function setDB(db) {
    sqliteInstance = db;
}

/**
 * 统一数据库接口入口
 * @param {Object} c - Hono context
 * @returns {Promise<Object>} 兼容 D1 API 的数据库对象
 */
export async function getDB(c) {
    if (!sqliteInstance) {
        throw new AppError('DB instance not initialized', 500);
    }
    return sqliteInstance;
}
