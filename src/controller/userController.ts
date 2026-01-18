// src/controllers/userController.ts
import { Context } from 'hono';
import AppError from '../utils/AppError.js';
import { logger } from '../logger/core.js';
import { getDB } from '../db/ts/factory.js';
import { getBjDateTime } from '../utils/time.js';

// 定义用户数据结构（可选但推荐）
interface User {
    id: number;
    username: string;
    email: string;
}

interface NewUser {
    username: string;
    email: string;
}

/**
 * 获取所有用户
 */
export const userList = async (c: Context) => {
    const db = await getDB(c);
    try {
        const { results } = await db
            .prepare('SELECT id, username, email FROM users')
            .bind()
            .all<User>();

        logger.info(`成功获取 ${results.length} 位用户`);
        return c.json({
            status: 'success',
            data: results,
        });
    } catch (err) {
        const error = err as Error;
        logger.error('查询用户列表失败', { error: error.message });
        throw new AppError('服务器内部错误', 500);
    }
};

/**
 * 根据 ID 获取单个用户
 */
export const getUserById = async (c: Context) => {
    const idStr = c.req.param('id');
    const id = parseInt(idStr, 10);

    if (isNaN(id) || id <= 0) {
        throw new AppError('用户ID必须是正整数', 400);
    }

    logger.info(`尝试获取ID为 ${id} 的用户`);
    const db = await getDB(c);
    const user = await db
        .prepare('SELECT id, username, email FROM users WHERE id = ?')
        .bind(id)
        .first<User>();

    if (!user) {
        logger.warn(`未找到ID为 ${id} 的用户`);
        throw new AppError(`找不到ID为 ${id} 的用户`, 404);
    }

    logger.info(`成功获取用户: ${user.username} (ID: ${id})`);
    return c.json({
        status: 'success',
        data: user,
    });
};

/**
 * 创建新用户
 */
export const saveUser = async (c: Context) => {
    let newUser: unknown;
    try {
        newUser = await c.req.json();
    } catch {
        throw new AppError('请求体必须是有效的 JSON', 400);
    }

    // 类型收窄 + 校验
    if (
        !newUser ||
        typeof newUser !== 'object' ||
        !('username' in newUser) ||
        !('email' in newUser) ||
        typeof newUser.username !== 'string' ||
        typeof newUser.email !== 'string' ||
        newUser.username.trim() === '' ||
        newUser.email.trim() === ''
    ) {
        throw new AppError('用户名和邮箱不能为空', 400);
    }

    const { username, email } = newUser as { username: string; email: string };

    const db = await getDB(c);

    // 检查邮箱是否已存在
    const existing = await db
        .prepare('SELECT id FROM users WHERE email = ?')
        .bind(email)
        .first();

    if (existing) {
        throw new AppError('该邮箱已被注册', 409);
    }

    try {
        const result = await db
            .prepare('INSERT INTO users (username, email, created_at) VALUES (?, ?, ?)')
            .bind(username, email, getBjDateTime())
            .run();

        const createdUser: User = {
            id: Number(result.meta.last_row_id),
            username,
            email,
        };

        logger.info(`创建新用户: ${createdUser.username} (ID: ${createdUser.id})`);
        return c.json({
            status: 'success',
            data: createdUser,
        });
    } catch (err) {
        const error = err as Error;
        if (error.message.includes('UNIQUE constraint failed')) {
            throw new AppError('用户名或邮箱已存在', 409);
        }
        logger.error('创建用户时发生未知错误', { error: error.message, stack: error.stack });
        throw new AppError('创建用户失败', 500);
    }
};