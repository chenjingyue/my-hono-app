// src/db/index.js
import AppError from "../utils/AppError.ts";
import {createD1} from "./d1.js";

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
        // 判断cloudflare的环境
        const db = await createD1(c);
        if (db){
            sqliteInstance = db;
            return sqliteInstance;
        }
        throw new AppError('DB instance not initialized', 500);
    }
    return sqliteInstance;
}
