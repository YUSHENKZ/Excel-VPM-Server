import { Request, Response } from 'express';
import logger from '../utils/logger';
import responseUtils from '../utils/responseUtils';
import configService from '../services/ConfigService';

/**
 * 配置控制器，处理配置相关的API请求
 */
class ConfigController {
  /**
   * 获取系统配置
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getConfig(req: Request, res: Response) {
    try {
      const config = await configService.getConfig();
      return responseUtils.success(res, config);
    } catch (err) {
      logger.error('获取配置失败', err);
      return responseUtils.serverError(res, `获取配置失败: ${(err as Error).message}`);
    }
  }
  
  /**
   * 更新系统配置
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async updateConfig(req: Request, res: Response) {
    try {
      const newConfig = req.body;
      
      // 验证配置
      if (!newConfig || typeof newConfig !== 'object') {
        return responseUtils.error(res, '无效的配置数据');
      }
      
      const updatedConfig = await configService.updateConfig(newConfig);
      return responseUtils.success(res, updatedConfig, '配置已更新');
    } catch (err) {
      logger.error('更新配置失败', err);
      return responseUtils.serverError(res, `更新配置失败: ${(err as Error).message}`);
    }
  }
}

export default new ConfigController(); 