// src/db/sqlite-adapter.ts
import { IDatabaseAdapter, IStatement, IStatementResult } from './types.js';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
import { initAllTables } from './init-tables.js';

// ✅ 为 SQLiteStatement 添加泛型方法（实际运行时无影响，仅类型层面）
interface SQLiteStatement {
    get<T = Record<string, any>>(...params: any[]): T | undefined;
    all<T = Record<string, any>>(...params: any[]): T[];
    run(...params: any[]): { lastInsertRowid: number; changes: number };
}

interface SQLiteDatabase {
    prepare(sql: string): SQLiteStatement;
    exec(sql: string): void;
    pragma(sql: string): void;
}

async function initTables(db: IDatabaseAdapter) {
    console.log('Initializing tables (Sqlite)...');
    await initAllTables(db);
    console.log('Tables initialized (Sqlite)');
}

export class SQLiteDatabaseAdapter implements IDatabaseAdapter {
    private db: SQLiteDatabase | null = null;

    private constructor() {}

    static async create(): Promise<IDatabaseAdapter> {
        const instance = new SQLiteDatabaseAdapter();
        await instance.init();
        return instance;
    }

    async init() {
        if (this.db) return;

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const projectRoot = path.resolve(__dirname, '..', '..', '..');
        const dbDir = path.join(projectRoot, 'data');
        const dbPath = path.join(dbDir, 'database.db');

        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        const require = createRequire(import.meta.url);
        const sqlite3 = require('better-sqlite3') as typeof import('better-sqlite3');
        const db = sqlite3(dbPath) as SQLiteDatabase;

        this.db = db;
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
        await initTables(this);
    }

    prepare(sql: string) {
        if (!this.db) {
            throw new Error('Database not initialized. Call init() first.');
        }

        return {
            bind: (...params: any[]) => {
                const stmt = this.db!.prepare(sql);

                return {
                    // ✅ 泛型方法：实际调用 get()，然后类型断言为 T
                    first: <T = Record<string, any>>(): Promise<T | null> => {
                        const result = stmt.get<T>(...params);
                        return Promise.resolve(result || null);
                    },
                    // ✅ 泛型方法：返回 { results: T[] }
                    all: <T = Record<string, any>>(): Promise<{ results: T[] }> => {
                        const results = stmt.all<T>(...params);
                        return Promise.resolve({ results });
                    },
                    run: (): Promise<IStatementResult> => {
                        const result = stmt.run(...params);
                        return Promise.resolve({
                            success: true,
                            meta: {
                                last_row_id: result.lastInsertRowid,
                                changes: result.changes,
                            },
                        });
                    },
                };
            },
        };
    }
}