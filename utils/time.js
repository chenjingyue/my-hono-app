/**
 * 时间格式化工具类 - 全局统一 东八区(北京时间+8)
 * 解决new Date()默认UTC时区问题，适配数据库插入/日志/接口返回等所有场景
 */
const moment = require('moment-timezone');

// 全局配置：固定东八区北京时间，永久生效
moment.tz.setDefault('Asia/Shanghai');

const TimeUtil = {
    /**
     * ✅ 【最常用、推荐】获取当前北京时间 - 数据库插入专用格式
     * 格式: YYYY-MM-DD HH:mm:ss （你的sqlite数据库datetime字段完美适配）
     * @returns {String} 例如: 2026-01-14 21:59:59
     */
    getBjDateTime() {
        return moment().format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * ✅ 获取当前北京时间 - 仅日期
     * 格式: YYYY-MM-DD
     * @returns {String} 例如: 2026-01-14
     */
    getBjDate() {
        return moment().format('YYYY-MM-DD');
    },

    /**
     * ✅ 获取当前北京时间 - 仅时间
     * 格式: HH:mm:ss
     * @returns {String} 例如: 21:59:59
     */
    getBjTime() {
        return moment().format('HH:mm:ss');
    },

    /**
     * ✅ 获取当前北京时间 - 带毫秒的完整格式
     * 格式: YYYY-MM-DD HH:mm:ss.SSS
     * @returns {String} 例如: 2026-01-14 21:59:59.123
     */
    getBjDateTimeWithMs() {
        return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    },

    /**
     * ✅ 传入任意时间，转为北京时间格式
     * @param {Date|String} time 可以是new Date()对象、UTC时间字符串、任意合法时间格式
     * @returns {String} 例如: 2026-01-14 21:59:59
     */
    formatToBj(time) {
        return moment(time).format('YYYY-MM-DD HH:mm:ss');
    },

    /**
     * ✅ 获取当前时间戳(毫秒)
     * @returns {Number}
     */
    getTimestamp() {
        return moment().valueOf();
    },

    /**
     * ✅ 获取当前时间戳(秒)
     * @returns {Number}
     */
    getUnixTimestamp() {
        return moment().unix();
    }
};

// 导出工具类，全局可用
module.exports = TimeUtil;