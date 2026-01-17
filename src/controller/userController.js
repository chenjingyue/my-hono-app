// 模拟数据库（实际项目中应使用 MongoDB/PostgreSQL 等）
import AppError from "../utils/AppError.ts";
import {logger} from "../utils/log-core.ts";
// import {getDB} from "../db/index.js";
import {getDB} from "../db/ts/factory.js";
import {getBjDateTime} from "../utils/time.js";

let users = [
    {id: 1, name: 'Alice', email: 'alice@example.com'},
    {id: 2, name: 'Bob', email: 'bob@example.com'}
];

/**
 * 获取所有用户
 */
export const userList = async (c) => {
    const db = await getDB(c);
    try {
        const {results} = await db.prepare('SELECT id, username, email FROM users').bind().all();
        logger.info(`成功获取 ${results.length} 位用户`);
        return c.json({
            status: 'success',
            data: results
        });
    } catch (err) {
        logger.error('查询用户列表失败', {error: err.message});
        throw new AppError('服务器内部错误', 500);
    }
};

/**
 * 根据 ID 获取单个用户
 */
export const getUserById = async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id) || id <= 0) {
        throw new AppError('用户ID必须是正整数', 400);
    }

    logger.info(`尝试获取ID为 ${id} 的用户`);
    const db = await getDB(c);
    const user = await db.prepare('SELECT id, username, email FROM users WHERE id = ?').bind(id).first();
    if (!user) {
        logger.warn(`未找到ID为 ${id} 的用户`);
        throw new AppError(`找不到ID为 ${id} 的用户`, 404);
    }
    logger.info(`成功获取用户: ${user.username} (ID: ${id})`);
    return c.json({
        status: 'success',
        data: user
    });
};

/**
 * 创建新用户
 */
export const saveUser = async (c) => {
    const newUser = await c.req.json();

    // 参数校验
    if (!newUser?.username || !newUser?.email) {
        throw new AppError('用户名和邮箱不能为空', 400);
    }

    const db = await getDB(c);
    // 检查邮箱是否已存在（可选，但推荐）
    const existing = await db
        .prepare('SELECT id FROM users WHERE email = ?')
        .bind(newUser.email)
        .first();
    if (existing) {
        throw new AppError('该邮箱已被注册', 409);
    }

    try { // 插入新用户
        const result = await db
            .prepare('INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)')
            .bind(newUser.username, newUser.email, getBjDateTime())
            .run();

        const createdUser = {
            id: result.meta.last_row_id,
            username: newUser.username,
            email: newUser.email
        };

        logger.info(`创建新用户: ${createdUser.username} (ID: ${createdUser.id})`);
        return c.json({
            status: 'success',
            data: createdUser
        });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            throw new AppError(`用户名或邮箱已存在`, 409);
        }
        logger.error(err)
        return c.json({error: '创建用户失败'},500);
    }
};


