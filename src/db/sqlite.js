
const { fileURLToPath } = await import('url');
const path = await import('path');
const fs = await import('fs');
const { createRequire } = await import('module');


let sqliteInstance = null;


function initSqliteInNode() {

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const projectRoot = path.resolve(__dirname, '..', '..');
    const dbDir = path.join(projectRoot, 'data');
    const dbPath = path.join(dbDir, 'database.db');

    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    const require = createRequire(import.meta.url);
    const betterSqlite3 = require('better-sqlite3');
    const db = betterSqlite3(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // 返回模拟 D1 API 的对象
    return  {
        prepare: (sql) => ({
            bind: (...params) => {
                const stmt = db.prepare(sql);
                return {
                    first: () => Promise.resolve(stmt.get(...params) || null),
                    all: () => Promise.resolve({ results: stmt.all(...params) }),
                    run: () => {
                        const result = stmt.run(...params);
                        return Promise.resolve({
                            success: true,
                            meta: {
                                last_row_id: result.lastInsertRowid,
                                changes: result.changes
                            }
                        });
                    }
                };
            }
        }),
        exec: (sql) => {
            db.exec(sql);
            return Promise.resolve({ success: true });
        }
    };
}

export function getDB(c) {
    // 💾 Node.js 环境：动态初始化 SQLite
    if (!sqliteInstance) {
        sqliteInstance = initSqliteInNode();
    }
    return sqliteInstance;
}