import chokidar from 'chokidar';
import path from 'path';
import { SystemConfig } from '../models';
import logger from '../utils/logger';
import configService from './ConfigService';
import fileUtils from '../utils/fileUtils';

/**
 * 文件监控服务，用于监控文件变化
 */
class FileWatcherService {
  private watchers: chokidar.FSWatcher[] = [];
  private eventListeners: { [key: string]: Array<(data: any) => void> } = {};
  private config: SystemConfig | null = null;
  
  constructor() {
    this.init();
  }
  
  /**
   * 初始化服务
   */
  private async init() {
    // 加载配置
    this.config = await configService.getConfig();
    
    // 监听配置变更
    configService.on('config-change', (config: SystemConfig) => {
      this.config = config;
      // 如果文件监控配置变更，重启监控
      this.restartWatchers();
    });
    
    // 启动文件监控
    this.startWatchers();
  }
  
  /**
   * 启动文件监控
   */
  private async startWatchers() {
    if (!this.config) return;
    
    // 清除现有监控
    this.stopWatchers();
    
    const { directories, fileTypes } = this.config.fileWatching;
    
    // 确保目录存在
    for (const dir of directories) {
      await fileUtils.ensureDirectoryExists(dir);
    }
    
    // 创建监控器
    const watcher = chokidar.watch(directories, {
      ignored: /(^|[\/\\])\../, // 忽略隐藏文件
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
      }
    });
    
    // 文件添加事件
    watcher.on('add', (filePath) => {
      if (this.isWatchedFileType(filePath, fileTypes)) {
        logger.info(`文件添加: ${filePath}`);
        this.emit('file-change', {
          type: 'add',
          path: filePath
        });
      }
    });
    
    // 文件修改事件
    watcher.on('change', (filePath) => {
      if (this.isWatchedFileType(filePath, fileTypes)) {
        logger.info(`文件修改: ${filePath}`);
        this.emit('file-change', {
          type: 'change',
          path: filePath
        });
      }
    });
    
    // 文件删除事件
    watcher.on('unlink', (filePath) => {
      if (this.isWatchedFileType(filePath, fileTypes)) {
        logger.info(`文件删除: ${filePath}`);
        this.emit('file-change', {
          type: 'unlink',
          path: filePath
        });
      }
    });
    
    // 错误事件
    watcher.on('error', (error) => {
      logger.error('文件监控错误:', error);
    });
    
    // 就绪事件
    watcher.on('ready', () => {
      logger.info('文件监控已启动');
    });
    
    this.watchers.push(watcher);
  }
  
  /**
   * 停止文件监控
   */
  private stopWatchers() {
    this.watchers.forEach(watcher => {
      watcher.close();
    });
    this.watchers = [];
  }
  
  /**
   * 重启文件监控
   */
  private restartWatchers() {
    this.stopWatchers();
    this.startWatchers();
  }
  
  /**
   * 检查文件类型是否被监控
   * @param filePath 文件路径
   * @param fileTypes 监控的文件类型
   * @returns 是否被监控
   */
  private isWatchedFileType(filePath: string, fileTypes: string[]): boolean {
    const ext = fileUtils.getFileExtension(filePath);
    return fileTypes.includes(ext);
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
export default new FileWatcherService(); 