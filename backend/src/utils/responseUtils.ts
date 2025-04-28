import { Response } from 'express';

// 状态码定义
export enum StatusCode {
  SUCCESS = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500
}

/**
 * 成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 响应消息
 * @param statusCode 状态码
 */
export const success = (
  res: Response,
  data: any = null,
  message = '操作成功',
  statusCode = StatusCode.SUCCESS
) => {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data
  });
};

/**
 * 创建成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 响应消息
 */
export const created = (
  res: Response,
  data: any = null,
  message = '创建成功'
) => {
  return success(res, data, message, StatusCode.CREATED);
};

/**
 * 错误响应
 * @param res Express响应对象
 * @param message 错误消息
 * @param statusCode 状态码
 */
export const error = (
  res: Response,
  message = '操作失败',
  statusCode = StatusCode.BAD_REQUEST
) => {
  return res.status(statusCode).json({
    code: statusCode,
    message,
    data: null
  });
};

/**
 * 未找到资源响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const notFound = (
  res: Response,
  message = '资源未找到'
) => {
  return error(res, message, StatusCode.NOT_FOUND);
};

/**
 * 服务器错误响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export const serverError = (
  res: Response,
  message = '服务器内部错误'
) => {
  return error(res, message, StatusCode.INTERNAL_ERROR);
};

export default {
  success,
  created,
  error,
  notFound,
  serverError,
  StatusCode
}; 