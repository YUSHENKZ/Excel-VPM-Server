import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { VisualizationConfig } from '../models';
import logger from '../utils/logger';
import fileUtils from '../utils/fileUtils';

// 异步文件操作
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 可视化配置保存目录
const visualizationsDir = process.env.VISUALIZATIONS_DIR || path.join(__dirname, '../../data/visualizations');

/**
 * 可视化配置服务，用于管理可视化配置
 */
class VisualizationService {
  private eventListeners: { [key: string]: Array<(data: any) => void> } = {};
  
  constructor() {
    this.init();
  }
  
  /**
   * 初始化服务
   */
  private async init() {
    try {
      // 确保目录存在
      await fileUtils.ensureDirectoryExists(visualizationsDir);
      logger.info('可视化配置目录已初始化');
    } catch (err) {
      logger.error('初始化可视化配置目录失败', err);
    }
  }
  
  /**
   * 获取文件的所有可视化配置
   * @param fileId 文件ID
   * @returns 可视化配置数组
   */
  public async getVisualizations(fileId: string): Promise<VisualizationConfig[]> {
    try {
      const filePath = this.getVisualizationFilePath(fileId);
      
      // 检查文件是否存在
      try {
        await fileUtils.statAsync(filePath);
      } catch (err) {
        // 文件不存在，返回空数组
        return [];
      }
      
      // 读取文件内容
      const data = await readFileAsync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      logger.error(`获取可视化配置失败: ${fileId}`, err);
      return [];
    }
  }
  
  /**
   * 创建新的可视化配置
   * @param fileId 文件ID
   * @param config 可视化配置
   * @returns 创建的可视化配置
   */
  public async createVisualization(fileId: string, config: VisualizationConfig): Promise<VisualizationConfig> {
    try {
      // 获取当前配置
      const visualizations = await this.getVisualizations(fileId);
      
      // 添加ID
      const newConfig = {
        ...config,
        id: uuidv4()
      };
      
      // 添加到数组
      visualizations.push(newConfig);
      
      // 保存文件
      await this.saveVisualizations(fileId, visualizations);
      
      // 触发事件
      this.emit('visualization-change', {
        type: 'create',
        fileId,
        config: newConfig
      });
      
      return newConfig;
    } catch (err) {
      logger.error(`创建可视化配置失败: ${fileId}`, err);
      throw err;
    }
  }
  
  /**
   * 更新可视化配置
   * @param fileId 文件ID
   * @param visId 可视化配置ID
   * @param config 更新的配置
   * @returns 更新后的配置
   */
  public async updateVisualization(fileId: string, visId: string, config: VisualizationConfig): Promise<VisualizationConfig> {
    try {
      // 获取当前配置
      const visualizations = await this.getVisualizations(fileId);
      
      // 查找配置
      const index = visualizations.findIndex(v => v.id === visId);
      if (index === -1) {
        throw new Error(`可视化配置不存在: ${visId}`);
      }
      
      // 更新配置
      const updatedConfig = {
        ...visualizations[index],
        ...config,
        id: visId // 确保ID不变
      };
      
      visualizations[index] = updatedConfig;
      
      // 保存文件
      await this.saveVisualizations(fileId, visualizations);
      
      // 触发事件
      this.emit('visualization-change', {
        type: 'update',
        fileId,
        config: updatedConfig
      });
      
      return updatedConfig;
    } catch (err) {
      logger.error(`更新可视化配置失败: ${fileId}, ${visId}`, err);
      throw err;
    }
  }
  
  /**
   * 删除可视化配置
   * @param fileId 文件ID
   * @param visId 可视化配置ID
   */
  public async deleteVisualization(fileId: string, visId: string): Promise<void> {
    try {
      // 获取当前配置
      const visualizations = await this.getVisualizations(fileId);
      
      // 过滤掉要删除的配置
      const filteredVisualizations = visualizations.filter(v => v.id !== visId);
      
      // 如果没有变化，说明要删除的配置不存在
      if (filteredVisualizations.length === visualizations.length) {
        throw new Error(`可视化配置不存在: ${visId}`);
      }
      
      // 保存文件
      await this.saveVisualizations(fileId, filteredVisualizations);
      
      // 触发事件
      this.emit('visualization-change', {
        type: 'delete',
        fileId,
        visId
      });
    } catch (err) {
      logger.error(`删除可视化配置失败: ${fileId}, ${visId}`, err);
      throw err;
    }
  }
  
  /**
   * 保存可视化配置
   * @param fileId 文件ID
   * @param visualizations 可视化配置数组
   */
  private async saveVisualizations(fileId: string, visualizations: VisualizationConfig[]): Promise<void> {
    try {
      const filePath = this.getVisualizationFilePath(fileId);
      
      // 确保目录存在
      await fileUtils.ensureDirectoryExists(visualizationsDir);
      
      // 写入文件
      await writeFileAsync(
        filePath,
        JSON.stringify(visualizations, null, 2),
        'utf8'
      );
      
      logger.info(`可视化配置已保存: ${fileId}`);
    } catch (err) {
      logger.error(`保存可视化配置失败: ${fileId}`, err);
      throw err;
    }
  }
  
  /**
   * 获取可视化配置文件路径
   * @param fileId 文件ID
   * @returns 文件路径
   */
  private getVisualizationFilePath(fileId: string): string {
    return path.join(visualizationsDir, `${fileId}.json`);
  }
  
  /**
   * 注册事件监听器
   * @param event 事件名称
   * @param callback 回调函数
   */
  public on(event: string, callback: (data: any) => void) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * 触发事件
   * @param event 事件名称
   * @param data 事件数据
   */
  private emit(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
}

// 单例模式
export default new VisualizationService(); 