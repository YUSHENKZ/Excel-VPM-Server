import { io, Socket } from 'socket.io-client';
import type { FileChangeEvent, ConfigChangeEvent, VisualizationChangeEvent } from '@/types';

// 事件处理器类型
type EventHandler<T> = (data: T) => void;
type MessageHandler = (data: any) => void;
type ErrorHandler = (error: Error) => void;
type ConnectionHandler = () => void;

// WebSocket事件类型
enum WebSocketEvents {
  FILE_CHANGE = 'file-change',
  CONFIG_CHANGE = 'config-change',
  VISUALIZATION_CHANGE = 'visualization-change',
}

class WebSocketService {
  private socket: Socket | null = null;
  private fileChangeHandlers: EventHandler<FileChangeEvent>[] = [];
  private configChangeHandlers: EventHandler<ConfigChangeEvent>[] = [];
  private visualizationChangeHandlers: EventHandler<VisualizationChangeEvent>[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];

  // 初始化WebSocket连接
  init() {
    if (this.socket) {
      // 如果已连接，先关闭旧连接
      this.disconnect();
    }

    this.socket = io({
      path: '/socket.io',
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    // 建立连接
    this.socket.on('connect', () => {
      console.log('WebSocket连接已建立');
      this.connectionHandlers.forEach(handler => handler());
    });

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error);
      this.errorHandlers.forEach(handler => handler(new Error(`WebSocket连接错误: ${error.message}`)));
    });

    // 连接断开
    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket连接已断开: ${reason}`);
    });

    // 文件变化事件
    this.socket.on(WebSocketEvents.FILE_CHANGE, (data: FileChangeEvent) => {
      console.log('文件变化事件:', data);
      this.fileChangeHandlers.forEach(handler => handler(data));
    });

    // 配置变化事件
    this.socket.on(WebSocketEvents.CONFIG_CHANGE, (data: ConfigChangeEvent) => {
      console.log('配置变化事件:', data);
      this.configChangeHandlers.forEach(handler => handler(data));
    });

    // 可视化配置变化事件
    this.socket.on(WebSocketEvents.VISUALIZATION_CHANGE, (data: VisualizationChangeEvent) => {
      console.log('可视化配置变化事件:', data);
      this.visualizationChangeHandlers.forEach(handler => handler(data));
    });
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // 添加文件变化事件处理器
  onFileChange(handler: EventHandler<FileChangeEvent>) {
    this.fileChangeHandlers.push(handler);
    return () => {
      this.fileChangeHandlers = this.fileChangeHandlers.filter(h => h !== handler);
    };
  }

  // 添加配置变化事件处理器
  onConfigChange(handler: EventHandler<ConfigChangeEvent>) {
    this.configChangeHandlers.push(handler);
    return () => {
      this.configChangeHandlers = this.configChangeHandlers.filter(h => h !== handler);
    };
  }

  // 添加可视化配置变化事件处理器
  onVisualizationChange(handler: EventHandler<VisualizationChangeEvent>) {
    this.visualizationChangeHandlers.push(handler);
    return () => {
      this.visualizationChangeHandlers = this.visualizationChangeHandlers.filter(h => h !== handler);
    };
  }

  // 添加错误处理器
  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  // 添加连接建立处理器
  onConnect(handler: ConnectionHandler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  // 检查是否已连接
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export default new WebSocketService(); 