// src/db/init-tables.ts
import { IDatabaseAdapter } from './types.js';
import { SCHEMAS } from './schema.js';

export async function initAllTables(db: IDatabaseAdapter) {
    // 注意：这里不能直接用 db.exec，因为 IDatabaseAdapter 没有 exec
    // 所以我们用 prepare + run（兼容 D1 和 SQLite）
    for (const [name, sql] of Object.entries(SCHEMAS)) {
        console.log(`Creating table: ${name}`);
        await db.prepare(sql).bind().run();
    }
}