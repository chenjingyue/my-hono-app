const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const TimeUtil = require("./time");

// 日志目录：项目根目录下的 logs/
const logDir = path.join(__dirname, '..', 'logs');

// 自定义时间戳格式（带 CST 时区）
const cstTimestamp = () => TimeUtil.getBjDateTimeWithMs();

// ✅ 【文件日志】格式化 - 顺序正确，不用改
const logFormat = winston.format.combine(
    winston.format.errors({ stack: true }), // 先解析错误堆栈
    winston.format.timestamp({ format: cstTimestamp }), // 再加时间戳
    winston.format.json() // 转JSON写入文件
);

const consoleFormat = winston.format.printf((logObj) => {
    const timestamp = logObj.timestamp || cstTimestamp();
    const level = logObj.level || 'info';
    // const logMeta = logObj.message || '';
    let logMsg = '';
    let stack = '';

    // ========== 核心：判断 message 类型 + 格式化 ==========
    if (typeof logObj.message === 'string') {
        logMsg = logObj.message;
    } else if (logObj.message instanceof Error) {
        logMsg = logObj.message.message;
        stack = logObj.message.stack || '';
    } else if (logObj.message instanceof Object) {
        logMsg = logObj.message?.error?.message;
        stack = logObj.message?.error?.stack || '';
    } else {
        logMsg = JSON.stringify(logObj.message, null, 2);
    }

    let finalLog  = `${timestamp} [${level.toUpperCase()}]: ${logMsg}`;
    if (stack) finalLog  += `\n${stack}`;
    return finalLog ;
});


// ✅ ✅ ✅ 核心改造1：判断是否为 Cloudflare 环境
// CF环境会自动注入这个环境变量，是官方判断标准，100%准确
const isCloudflare = typeof process.env.CF_PAGES !== 'undefined' || typeof process.env.CF_WORKERS !== 'undefined';

// ✅ ✅ ✅ 核心改造2：双环境日志配置
const loggerConfig = {
    level: 'info',
    format: logFormat,
    transports: [] // 初始化空传输器
};

// 👉 【非CF服务器环境】
if (!isCloudflare) {
    loggerConfig.transports.push(
        new DailyRotateFile({
            dirname: logDir,
            filename: 'combined-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            maxSize: '50m',
            maxFiles: '30d',
            zippedArchive: true
        }),
        new DailyRotateFile({
            dirname: logDir,
            filename: 'error-%DATE%.log',
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            maxSize: '50m',
            maxFiles: '30d',
            zippedArchive: true
        })
    );
}

// 👉 【本地开发环境 + Cloudflare环境 通用】- 只启用控制台日志，复用你的自定义格式化
// ✅ 本地开发：控制台打印格式化日志
// ✅ CF环境：控制台日志被CF捕获，格式和本地一致
if (process.env.NODE_ENV === 'dev' || isCloudflare) {
    loggerConfig.transports.push(
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.errors({ stack: true }),
                winston.format.timestamp({ format: cstTimestamp }),
                consoleFormat // 你的自定义格式，完美复用
            )
        })
    );
}

// 创建日志实例
const logger = winston.createLogger(loggerConfig);

module.exports = logger;