/**
 * 对象工具类 - 提供安全的对象操作方法
 * 兼容 Node.js / Cloudflare Workers / 浏览器
 */

/**
 * 判断值是否为“空对象”
 * - null、undefined、非对象类型 → 视为“空”
 * - {}（无自有可枚举属性）→ 视为“空”
 * - {a:1}、[]、new Date() 等 → 非空（注意：数组也被视为非空对象）
 *
 * @param {*} obj - 待检测的值
 * @returns {boolean} true 表示“空”，false 表示“非空对象”
 */
function isEmptyObject(obj) {
    return !obj || typeof obj !== 'object' || Object.keys(obj).length === 0;
}

/**
 * 【可选增强】更严格的“纯空对象”判断（排除数组、Date、RegExp 等）
 * 只有字面量对象 {} 或 Object.create(null) 才算“对象”
 *
 * @param {*} obj
 * @returns {boolean}
 */
function isPlainEmptyObject(obj) {
    if (!obj || typeof obj !== 'object') return true;
    if (Array.isArray(obj)) return false;
    if (obj.constructor !== Object && obj.constructor !== undefined) return false;
    return Object.keys(obj).length === 0;
}

/**
 * 安全地获取对象的键数量（避免对 null/undefined 调用 Object.keys）
 * @param {*} obj
 * @returns {number}
 */
function getObjectSize(obj) {
    return obj && typeof obj === 'object' ? Object.keys(obj).length : 0;
}

// 命名导出，支持 tree-shaking
export {
    isEmptyObject,
    isPlainEmptyObject,
    getObjectSize
};