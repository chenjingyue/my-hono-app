import app from "./app/app";
import { setLoggerImpl } from './utils/log-core.ts';
import { createCfLogger } from './utils/log-cf.js';

// 初始化日志器（CF 版本）
setLoggerImpl(createCfLogger());

export default app