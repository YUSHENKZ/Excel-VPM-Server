import { Response } from 'express';
export declare enum StatusCode {
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
export declare const success: (res: Response, data?: any, message?: string, statusCode?: StatusCode) => Response<any, Record<string, any>>;
/**
 * 创建成功响应
 * @param res Express响应对象
 * @param data 响应数据
 * @param message 响应消息
 */
export declare const created: (res: Response, data?: any, message?: string) => Response<any, Record<string, any>>;
/**
 * 错误响应
 * @param res Express响应对象
 * @param message 错误消息
 * @param statusCode 状态码
 */
export declare const error: (res: Response, message?: string, statusCode?: StatusCode) => Response<any, Record<string, any>>;
/**
 * 未找到资源响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export declare const notFound: (res: Response, message?: string) => Response<any, Record<string, any>>;
/**
 * 服务器错误响应
 * @param res Express响应对象
 * @param message 错误消息
 */
export declare const serverError: (res: Response, message?: string) => Response<any, Record<string, any>>;
declare const _default: {
    success: (res: Response, data?: any, message?: string, statusCode?: StatusCode) => Response<any, Record<string, any>>;
    created: (res: Response, data?: any, message?: string) => Response<any, Record<string, any>>;
    error: (res: Response, message?: string, statusCode?: StatusCode) => Response<any, Record<string, any>>;
    notFound: (res: Response, message?: string) => Response<any, Record<string, any>>;
    serverError: (res: Response, message?: string) => Response<any, Record<string, any>>;
    StatusCode: typeof StatusCode;
};
export default _default;
