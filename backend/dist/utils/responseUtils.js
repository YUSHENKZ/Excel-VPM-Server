"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serverError = exports.notFound = exports.error = exports.created = exports.success = exports.StatusCode = void 0;
// 状态码定义
var StatusCode;
(function (StatusCode) {
    StatusCode[StatusCode["SUCCESS"] = 200] = "SUCCESS";
    StatusCode[StatusCode["CREATED"] = 201] = "CREATED";
    StatusCode[StatusCode["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    StatusCode[StatusCode["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    StatusCode[StatusCode["FORBIDDEN"] = 403] = "FORBIDDEN";
    StatusCode[StatusCode["NOT_FOUND"] = 404] = "NOT_FOUND";
    StatusCode[StatusCode["INTERNAL_ERROR"] = 500] = "INTERNAL_ERROR";
})(StatusCode || (exports.StatusCode = StatusCode = {}));
/**
 * 成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode 状态码
 */
const success = (res, data = null, message = '操作成功', statusCode = StatusCode.SUCCESS) => {
    return res.status(statusCode).json({
        code: statusCode,
        message,
        data
    });
};
exports.success = success;
/**
 * 创建成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 响应消息
 */
const created = (res, data = null, message = '创建成功') => {
    return (0, exports.success)(res, data, message, StatusCode.CREATED);
};
exports.created = created;
/**
 * 错误响应
 * @param res Express响应对象
 * @param message 错误消息
 * @param statusCode 状态码
 */
const error = (res, message = '操作失败', statusCode = StatusCode.BAD_REQUEST) => {
    return res.status(statusCode).json({
        code: statusCode,
        message,
        data: null
    });
};
exports.error = error;
/**
 * 未找到资源响应
 * @param res Express响应对象
 * @param message 错误消息
 */
const notFound = (res, message = '资源未找到') => {
    return (0, exports.error)(res, message, StatusCode.NOT_FOUND);
};
exports.notFound = notFound;
/**
 * 服务器错误响应
 * @param res Express响应对象
 * @param message 错误消息
 */
const serverError = (res, message = '服务器内部错误') => {
    return (0, exports.error)(res, message, StatusCode.INTERNAL_ERROR);
};
exports.serverError = serverError;
exports.default = {
    success: exports.success,
    created: exports.created,
    error: exports.error,
    notFound: exports.notFound,
    serverError: exports.serverError,
    StatusCode
};
//# sourceMappingURL=responseUtils.js.map