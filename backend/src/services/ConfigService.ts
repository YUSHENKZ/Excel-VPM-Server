import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { SystemConfig } from '../models';
import logger from '../utils/logger';
import fileUtils from '../utils/fileUtils';

// 异步文件操作
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

// 环境变量中的配置文件路径
const configPath = process.env.CONFIG_PATH || path.join(__dirname, '../../config/config.json');

// 默认配置
const defaultConfig: SystemConfig = {
  fileWatching: {
    directories: ['./data', './uploads'],
    fileTypes: ['.csv', '.xlsx', '.json'],
    watchInterval: 5000
  },
  visualization: {
    defaultChartType: 'bar',
    colorScheme: 'default',
    autoRefresh: true,
    refreshInterval: 30000
  },
  ui: {
    theme: 'light',
    language: 'zh-CN',
    tableSettings: {
      pageSize: 50,
      enableSearch: true
    }
  }
};

/**
 * 配置服务，负责读取和保存系统配置
 */
class ConfigService {
  private config: SystemConfig;
  private eventListeners: { [key: string]: Array<(data: any) => void> } = {};

  constructor() {
    this.config = { ...defaultConfig };
    this.init();
  }

  /**
   * 初始化配置
   */
  private async init() {
    try {
      await this.loadConfig();
      logger.info('配置已加载');
    } catch (err) {
      logger.error('加载配置失败，使用默认配置', err);
      // 如果配置文件不存在，创建它
      await this.saveConfig(defaultConfig);
    }
  }

  /**
   * 从配置文件加载配置
   */
  private async loadConfig() {
    try {
      // 确保目录存在
      const configDir = path.dirname(configPath);
      await fileUtils.ensureDirectoryExists(configDir);

      const data = await readFileAsync(configPath, 'utf8');
      this.config = JSON.parse(data);
      return this.config;
    } catch (err) {
      logger.error('读取配置文件失败', err);
      throw err;
    }
  }

  /**
   * 获取系统配置
   * @returns 系统配置
   */
  public async getConfig(): Promise<SystemConfig> {
    return this.config;
  }

  /**
   * 更新系统配置
   * @param newConfig 新的配置
   * @returns 更新后的配置
   */
  public async updateConfig(newConfig: SystemConfig): Promise<SystemConfig> {
    this.config = {
      ...this.config,
      ...newConfig
    };
    
    await this.saveConfig(this.config);
    this.emit('config-change', this.config);
    
    return this.config;
  }

  /**
   * 保存配置到文件
   * @param config 要保存的配置
   */
  private async saveConfig(config: SystemConfig) {
    try {
      const configDir = path.dirname(configPath);
      await fileUtils.ensureDirectoryExists(configDir);
      
      await writeFileAsync(
        configPath,
        JSON.stringify(config, null, 2),
        'utf8'
      );
      
      logger.info('配置已保存');
    } catch (err) {
      logger.error('保存配置失败', err);
      throw err;
    }
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
export default new ConfigService(); 