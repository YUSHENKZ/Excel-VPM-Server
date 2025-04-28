import { Request, Response } from 'express';
import logger from '../utils/logger';
import responseUtils from '../utils/responseUtils';
import visualizationService from '../services/VisualizationService';

/**
 * 可视化控制器，处理可视化配置相关的API请求
 */
class VisualizationController {
  /**
   * 获取文件的所有可视化配置
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getVisualizations(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      
      if (!fileId) {
        return responseUtils.error(res, '未提供文件ID');
      }
      
      const visualizations = await visualizationService.getVisualizations(fileId);
      return responseUtils.success(res, visualizations);
    } catch (err) {
      logger.error('获取可视化配置失败', err);
      return responseUtils.serverError(res, `获取可视化配置失败: ${(err as Error).message}`);
    }
  }
  
  /**
   * 创建新的可视化配置
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async createVisualization(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      const config = req.body;
      
      if (!fileId) {
        return responseUtils.error(res, '未提供文件ID');
      }
      
      if (!config || typeof config !== 'object') {
        return responseUtils.error(res, '无效的可视化配置数据');
      }
      
      const newVisualization = await visualizationService.createVisualization(fileId, config);
      return responseUtils.created(res, newVisualization, '可视化配置已创建');
    } catch (err) {
      logger.error('创建可视化配置失败', err);
      return responseUtils.serverError(res, `创建可视化配置失败: ${(err as Error).message}`);
    }
  }
  
  /**
   * 更新可视化配置
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async updateVisualization(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      const visId = req.params.visId;
      const config = req.body;
      
      if (!fileId || !visId) {
        return responseUtils.error(res, '未提供文件ID或可视化配置ID');
      }
      
      if (!config || typeof config !== 'object') {
        return responseUtils.error(res, '无效的可视化配置数据');
      }
      
      const updatedVisualization = await visualizationService.updateVisualization(fileId, visId, config);
      return responseUtils.success(res, updatedVisualization, '可视化配置已更新');
    } catch (err) {
      logger.error('更新可视化配置失败', err);
      
      // 如果是因为配置不存在导致的错误，返回404
      if ((err as Error).message.includes('不存在')) {
        return responseUtils.notFound(res, (err as Error).message);
      }
      
      return responseUtils.serverError(res, `更新可视化配置失败: ${(err as Error).message}`);
    }
  }
  
  /**
   * 删除可视化配置
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async deleteVisualization(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      const visId = req.params.visId;
      
      if (!fileId || !visId) {
        return responseUtils.error(res, '未提供文件ID或可视化配置ID');
      }
      
      await visualizationService.deleteVisualization(fileId, visId);
      return responseUtils.success(res, null, '可视化配置已删除');
    } catch (err) {
      logger.error('删除可视化配置失败', err);
      
      // 如果是因为配置不存在导致的错误，返回404
      if ((err as Error).message.includes('不存在')) {
        return responseUtils.notFound(res, (err as Error).message);
      }
      
      return responseUtils.serverError(res, `删除可视化配置失败: ${(err as Error).message}`);
    }
  }
}

export default new VisualizationController(); 