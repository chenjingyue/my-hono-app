// src/db/sqlite-adapter.ts
import { IDatabaseAdapter, IStatement, IStatementResult } from './types.js';
import { fileURLToPath } from 'url';
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
import {initAllTables} from "./init-tables.js";

// 声明 better-sqlite3 类型（简化版）
interface SQLiteStatement {
    get(...params: any[]): Record<string, any> | undefined;
    all(...params: any[]): Record<string, any>[];
    run(...params: any[]): { lastInsertRowid: number; changes: number };
}

interface SQLiteDatabase {
    prepare(sql: string): SQLiteStatement;
    exec(sql: string): void;
    pragma(sql: string): void;
}

async function initTables(db: IDatabaseAdapter) {
    console.log('Initializing tables (Sqlite)...');
    await initAllTables(db)
    console.log('Tables initialized (Sqlite)');
}

export class SQLiteDatabaseAdapter implements IDatabaseAdapter {
    private db: SQLiteDatabase | null = null;

    private constructor() {
        // 私有构造函数，禁止直接 new
    }

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
        //     db.exec(`
        //   CREATE TABLE IF NOT EXISTS users (
        //     id INTEGER PRIMARY KEY AUTOINCREMENT,
        //     username TEXT NOT NULL UNIQUE,
        //     email TEXT NOT NULL UNIQUE,
        //     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        //   )
        // `);
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
                    first: () => Promise.resolve(stmt.get(...params) || null),
                    all: () => Promise.resolve({ results: stmt.all(...params) }),
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