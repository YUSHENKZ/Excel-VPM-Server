import { Request, Response } from 'express';
/**
 * 可视化控制器，处理可视化配置相关的API请求
 */
declare class VisualizationController {
    /**
     * 获取文件的所有可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    getVisualizations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 创建新的可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    createVisualization(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 更新可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    updateVisualization(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * 删除可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    deleteVisualization(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: VisualizationController;
export default _default;
