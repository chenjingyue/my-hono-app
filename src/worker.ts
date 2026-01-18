import app from "./app/app.js";
import { setLogger } from './logger/core.js';
import { CfLogger } from './logger/adapters/cf-logger.js';

setLogger(new CfLogger());

export default app