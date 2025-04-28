import { Request, Response } from 'express';
/**
 * 配置控制器，处理配置相关的API请求
 */
declare class ConfigController {
    /**
     * 获取系统配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    getConfig(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 更新系统配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    updateConfig(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: ConfigController;
export default _default;
