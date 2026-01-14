import AppError from "../utils/AppError.js";


function initTables(db) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
}

export function getDB(c) {
    // 🌩️ Cloudflare 环境（包括 wrangler dev）
    if (c?.env?.RUNTIME === 'cloudflare') {
        const db = c.env.MY_DATABASE;
        if (!globalThis._D1_INIT) {
            initTables(db);
            globalThis._D1_INIT = true;
        }
        return db;
    } else {
      throw new AppError('Not in Cloudflare environment', 500);
    }
}