// src/db/d1-adapter.ts
import { IDatabaseAdapter, IStatement, IStatementResult } from './types.js';
import {initAllTables} from "./init-tables.js";

// Cloudflare D1 的类型（官方未提供，我们简单声明）
interface D1Result {
    success: true;
    meta: {
        last_row_id: number | null;
        changes: number;
        duration: number;
    };
}

interface D1PreparedStatement {
    bind(...values: any[]): {
        first(colName?: string): Promise<Record<string, any> | null>;
        all(): Promise<{ results: Record<string, any>[] }>;
        run(): Promise<D1Result>;
    };
}

interface D1Database {
    prepare(sql: string): D1PreparedStatement;
}

async function initTables(db: IDatabaseAdapter) {
    console.log('Initializing tables (D1)...');
    await initAllTables(db)
    console.log('Tables initialized (D1)');
}

export class D1DatabaseAdapter implements IDatabaseAdapter {
    private db: D1Database ;

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
                return {
                    first: () => stmt.first(),
                    all: () => stmt.all(),
                    run: async (): Promise<IStatementResult> => {
                        const result = await stmt.run();
                        return {
                            success: true,
                            meta: {
                                last_row_id: result.meta.last_row_id ?? -1, // D1 可能为 null
                                changes: result.meta.changes,
                            },
                        };
                    },
                };
            },
        };
    }
}