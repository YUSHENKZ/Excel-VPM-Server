import { Server, Socket } from 'socket.io';
import http from 'http';
import logger from '../utils/logger';
import fileWatcherService from '../services/FileWatcherService';
import configService from '../services/ConfigService';
import visualizationService from '../services/VisualizationService';

/**
 * WebSocket控制器，处理WebSocket连接和事件
 */
class WebSocketController {
  private io: Server | null = null;
  
  /**
   * 初始化WebSocket服务器
   * @param server HTTP服务器实例
   */
  public init(server: http.Server) {
    this.io = new Server(server, {
      path: '/socket.io',
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
      }
    });
    
    // 连接事件
    this.io.on('connection', (socket: Socket) => {
      const clientId = socket.id;
      logger.info(`WebSocket客户端连接: ${clientId}`);
      
      // 断开连接事件
      socket.on('disconnect', () => {
        logger.info(`WebSocket客户端断开连接: ${clientId}`);
      });
      
      // 错误事件
      socket.on('error', (error) => {
        logger.error(`WebSocket错误: ${clientId}`, error);
      });
    });
    
    // 监听文件变化事件
    this.setupFileChangeListener();
    
    // 监听配置变化事件
    this.setupConfigChangeListener();
    
    // 监听可视化配置变化事件
    this.setupVisualizationChangeListener();
    
    logger.info('WebSocket服务已初始化');
  }
  
  /**
   * 设置文件变化监听器
   */
  private setupFileChangeListener() {
    fileWatcherService.on('file-change', (data) => {
      if (this.io) {
        this.io.emit('file-change', data);
        logger.info(`文件变化事件已广播: ${data.type}, ${data.path}`);
      }
    });
  }
  
  /**
   * 设置配置变化监听器
   */
  private setupConfigChangeListener() {
    configService.on('config-change', (data) => {
      if (this.io) {
        this.io.emit('config-change', data);
        logger.info('配置变化事件已广播');
      }
    });
  }
  
  /**
   * 设置可视化配置变化监听器
   */
  private setupVisualizationChangeListener() {
    visualizationService.on('visualization-change', (data) => {
      if (this.io) {
        this.io.emit('visualization-change', data);
        logger.info(`可视化配置变化事件已广播: ${data.type}, 文件ID: ${data.fileId}`);
      }
    });
  }
}

export default new WebSocketController(); 