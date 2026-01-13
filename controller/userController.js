// 模拟数据库（实际项目中应使用 MongoDB/PostgreSQL 等）
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const TimeUtil = require("../utils/time");

let users = [
    {id: 1, name: 'Alice', email: 'alice@example.com'},
    {id: 2, name: 'Bob', email: 'bob@example.com'}
];

let nextId = 3;

exports.userList = async (c) => {
    return c.json({
        status: 'success',
        data: users
    });
}

exports.getUserById = async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    logger.info("123")
    if (isNaN(id)) {
        throw new AppError('用户ID必须是数字', 400);
    }
    logger.info(`获取ID为${id}的用户`);
    const user = users.find(u => u.id === id);
    if (!user) {
        throw new AppError(`找不到ID为${id}的用户`, 404);
    }
    return c.json({
        status: 'success',
        data: user
    });
}

exports.saveUser = async (c) => {
    const newUser = await c.req.json(); // ✅ Hono获取POST请求体的正确写法
    if (!newUser.username || !newUser.email) {
        throw new AppError('用户名和邮箱不能为空', 400);
    }
    newUser.id = users.length + 1;
    users.push(newUser);
    logger.info(`创建新用户: ${newUser.username}`);
    return c.status(201).json({
        status: 'success',
        data: newUser
    });
};


