import http from 'http';
import dotenv from 'dotenv';
import app from './app';
import logger from './utils/logger';
import webSocketController from './controllers/WebSocketController';
import fileWatcherService from './services/FileWatcherService';
import fileUtils from './utils/fileUtils';

// 加载环境变量
dotenv.config();

// 获取端口号
const port = process.env.PORT || 3001;

// 创建HTTP服务器
const server = http.createServer(app);

// 初始化WebSocket服务
webSocketController.init(server);

// 启动服务器
server.listen(port, async () => {
  logger.info(`服务器已启动，监听端口 ${port}`);
  
  // 确保数据目录存在
  const dataDir = process.env.DATA_DIR || './data';
  const uploadsDir = process.env.UPLOADS_DIR || './uploads';
  
  await fileUtils.ensureDirectoryExists(dataDir);
  await fileUtils.ensureDirectoryExists(uploadsDir);
  
  logger.info(`数据目录: ${dataDir}`);
  logger.info(`上传目录: ${uploadsDir}`);
  
  // 这里文件监控服务会在构造函数中自动启动
  logger.info('文件监控服务已启动');
});

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  // 继续运行
});

// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
  logger.error('未处理的Promise拒绝:', reason);
  // 继续运行
});

// 处理退出信号
process.on('SIGTERM', () => {
  logger.info('收到SIGTERM信号，正在优雅关闭...');
  server.close(() => {
    logger.info('服务器已关闭');
    process.exit(0);
  });
}); 