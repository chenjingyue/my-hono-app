// src/db/d1-adapter.ts
import { IDatabaseAdapter, IStatement, IStatementResult } from './types.js';
import { initAllTables } from './init-tables.js';

interface D1Result {
    success: true;
    meta: {
        last_row_id: number | null;
        changes: number;
        duration: number;
    };
}

// ✅ 使用官方类型（推荐）或保留你的简化声明，但要加泛型
interface D1PreparedStatement {
    bind(...values: any[]): {
        first<T = Record<string, any>>(colName?: string): Promise<T | null>;
        all<T = Record<string, any>>(): Promise<{ results: T[] }>;
        run(): Promise<D1Result>;
    };
}

interface D1Database {
    prepare(sql: string): D1PreparedStatement;
}

async function initTables(db: IDatabaseAdapter) {
    console.log('Initializing tables (D1)...');
    await initAllTables(db);
    console.log('Tables initialized (D1)');
}

export class D1DatabaseAdapter implements IDatabaseAdapter {
    private db: D1Database;

    private constructor(d1Instance: D1Database) {
        this.db = d1Instance;
    }

    static async create(d1Instance: D1Database): Promise<IDatabaseAdapter> {
        const instance = new D1DatabaseAdapter(d1Instance);
        await instance.init();
        return instance;
    }

    async init() {
        await initTables(this);
    }

    prepare(sql: string) {
        return {
            bind: (...params: any[]) => {
                const stmt = this.db.prepare(sql).bind(...params);

                // ✅ 返回符合 IStatement 泛型签名的对象
                return {
                    first: <T = Record<string, any>>() => stmt.first<T>(),
                    all: <T = Record<string, any>>() => stmt.all<T>(),
                    run: async (): Promise<IStatementResult> => {
                        const result = await stmt.run();
                        return {
                            success: true,
                            meta: {
                                last_row_id: result.meta.last_row_id ?? -1,
                                changes: result.meta.changes,
                            },
                        };
                    },
                };
            },
        };
    }
}