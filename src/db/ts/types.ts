// src/db/types.ts

export interface IStatementResult {
    success: true;
    meta: {
        last_row_id: number;
        changes: number;
    };
}

export interface IStatement {
    first(): Promise<Record<string, any> | null>;
    all(): Promise<{ results: Record<string, any>[] }>;
    run(): Promise<IStatementResult>;
}

export interface IDatabaseAdapter {
    init(): Promise<void>;
    prepare(sql: string): {
        bind(...params: any[]): IStatement;
    };
}