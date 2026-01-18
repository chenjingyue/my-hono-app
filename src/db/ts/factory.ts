// src/db/factory.ts
import { IDatabaseAdapter } from './types.js';
import {D1DatabaseAdapter} from "./d1-adapter.js";

let globalAdapter: IDatabaseAdapter | null = null;

// Hono Context-like 类型（简化）
interface HonoContext {
    env?: {
        RUNTIME?: string;
        MY_DATABASE?: any; // D1Database
    };
}

export function setDB(adapter: IDatabaseAdapter) {
    globalAdapter = adapter
}

export async function getDB(c: HonoContext): Promise<IDatabaseAdapter> {
    if (globalAdapter) {
        return globalAdapter;
    }

    if (c?.env?.RUNTIME === 'cloudflare' && c.env.MY_DATABASE) {
        console.log('Using D1 adapter');
        globalAdapter = await D1DatabaseAdapter.create(c.env.MY_DATABASE);
    } else {
        console.log('Using SQLite adapter (Node.js)');
        throw new Error('SQLite adapter is null');
        // globalAdapter = new SQLiteDatabaseAdapter();
    }
    return globalAdapter;
}