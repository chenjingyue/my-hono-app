// src/logger/adapters/node-logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import {Logger} from '../types.js';
import {formatLogLine} from '../formatters/bj-formatter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logDir = join(__dirname, '..', '..',  '..','logs');

// 自定义 Console 格式（复用 formatLogLine）
const consoleFormat = winston.format.printf(({level, message, timestamp, ...meta}) => {
    // 注意：winston 会把 meta 合并到 log 对象中，所以 meta 就是剩余字段
    const metaObj = meta as Record<string, unknown>;
    return formatLogLine(level, message, metaObj);
});

function createWinstonLogger() {
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.errors({stack: true}),
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
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
        ]
    });

    // 开发环境加控制台
    if (process.env.NODE_ENV === 'dev') {
        logger.add(
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.errors({stack: true}),
                    winston.format.timestamp(),
                    consoleFormat
                )
            })
        );
    }

    return logger;
}

export class NodeLogger implements Logger {
    private winstonLogger: winston.Logger;

    constructor() {
        this.winstonLogger = createWinstonLogger();
    }

    log(level: string, message: unknown, meta: Record<string, unknown> = {}) {
        this.winstonLogger.log(level, JSON.stringify(message), meta);
    }

    info(msg: unknown, meta?: Record<string, unknown>) {
        this.log('info', msg, meta);
    }

    warn(msg: unknown, meta?: Record<string, unknown>) {
        this.log('warn', msg, meta);
    }

    error(msg: unknown, meta?: Record<string, unknown>) {
        this.log('error', msg, meta);
    }

    debug(msg: unknown, meta?: Record<string, unknown>) {
        this.log('debug', msg, meta);
    }
}