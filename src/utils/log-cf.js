// src/platforms/cf-log-core.ts
import { getBjDateTimeWithMs } from './time.js';
import {isEmptyObject} from "./object-utils.js";


function formatLog(level, message, meta = {}) {
    const timestamp = getBjDateTimeWithMs();
    let logMsg = '';
    let stack = '';

    if (typeof message === 'string') {
        logMsg = message;
    } else if (message instanceof Error) {
        logMsg = message.message;
        stack = message.stack || '';
    } else if (message instanceof Object) {
        logMsg = message.error?.message;
        stack = message.error?.stack || '';
    } else {
        logMsg = JSON.stringify(message, null, 2);
    }
    let metaPart = '';
    if(!isEmptyObject(meta)) {
        metaPart = ' ' + JSON.stringify(meta, null, 2);
    }

    let finalLog  = `${timestamp} [${level.toUpperCase()}]: ${logMsg}${metaPart}`;
    if (stack) finalLog  += `\n${stack}`;
    return finalLog ;
}

export function createCfLogger() {
    return {
        log(level, message, meta) {
            const formatted = formatLog(level, message, meta);
            if (level === 'error' || level === 'warn') {
                console.error(formatted);
            } else {
                console.log(formatted);
            }
        }
    };
}