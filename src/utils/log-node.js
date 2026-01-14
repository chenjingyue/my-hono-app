import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {getBjDateTimeWithMs} from "./time.js";

// __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logDir = join(__dirname, '..', '..', 'logs');
// 自定义时间戳格式（带 CST 时区）
const cstTimestamp = () => getBjDateTimeWithMs();

// ✅ 【文件日志】格式化 - 顺序正确，不用改
const logFormat = winston.format.combine(
    winston.format.errors({stack: true}), // 先解析错误堆栈
    winston.format.timestamp({format: cstTimestamp}), // 再加时间戳
    winston.format.json() // 转JSON写入文件
);

const consoleFormat = winston.format.printf((logObj) => {

    let { level, message, timestamp, stack, ...metaFields } = logObj;
    timestamp = timestamp || cstTimestamp();
    level = level || 'info';
    stack = '';
    let logMsg;

    // ========== 核心：判断 message 类型 + 格式化 ==========
    if (typeof message === 'string') {
        logMsg = message;
    } else if (message instanceof Error) {
        logMsg = message.message;
        stack = message.stack || '';
    } else if (message instanceof Object) {
        logMsg = message?.error?.message;
        stack = message?.error?.stack || '';
    } else {
        logMsg = JSON.stringify(message, null, 2);
    }
    let metaPart = '';
    if (Object.keys(metaFields).length > 0) {
        metaPart = ' ' + JSON.stringify(metaFields, null, 2);
    }

    let finalLog = `${timestamp} [${level.toUpperCase()}]: ${logMsg}${metaPart}`;
    if (stack) finalLog += `\n${stack}`;
    return finalLog;
});


function initLoggerConfig() {
    const loggerConfig = {
        level: 'info',
        format: logFormat,
        transports: [] // 初始化空传输器
    };
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
// ✅ 本地开发：控制台打印格式化日志
    if (process.env.NODE_ENV === 'dev') {
        loggerConfig.transports.push(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.errors({stack: true}),
                    winston.format.timestamp({format: cstTimestamp}),
                    consoleFormat // 你的自定义格式，完美复用
                )
            })
        );
    }
    return loggerConfig;
}

// 导出适配器
export function createNodeLogger() {
    // 创建日志实例
    const nodeLogger = winston.createLogger(initLoggerConfig());
    return {
        log(level, message, meta) {
            nodeLogger[level](message, meta);
        }
    };
}