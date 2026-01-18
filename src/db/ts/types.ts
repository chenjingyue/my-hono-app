// src/db/types.ts

export interface IStatementResult {
    success: true;
    meta: {
        last_row_id: number;
        changes: number;
    };
}

export interface IStatement {
    first<T = Record<string, any>>(): Promise<T | null>;
    all<T = Record<string, any>>(): Promise<{ results: T[] }>;
    run(): Promise<IStatementResult>;
}

export interface IDatabaseAdapter {
    init(): Promise<void>;
    prepare(sql: string): {
        bind(...params: any[]): IStatement;
    };
}