"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger"));
const WebSocketController_1 = __importDefault(require("./controllers/WebSocketController"));
const fileUtils_1 = __importDefault(require("./utils/fileUtils"));
// 加载环境变量
dotenv_1.default.config();
// 获取端口号
const port = process.env.PORT || 3001;
// 创建HTTP服务器
const server = http_1.default.createServer(app_1.default);
// 初始化WebSocket服务
WebSocketController_1.default.init(server);
// 启动服务器
server.listen(port, async () => {
    logger_1.default.info(`服务器已启动，监听端口 ${port}`);
    // 确保数据目录存在
    const dataDir = process.env.DATA_DIR || './data';
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    await fileUtils_1.default.ensureDirectoryExists(dataDir);
    await fileUtils_1.default.ensureDirectoryExists(uploadsDir);
    logger_1.default.info(`数据目录: ${dataDir}`);
    logger_1.default.info(`上传目录: ${uploadsDir}`);
    // 这里文件监控服务会在构造函数中自动启动
    logger_1.default.info('文件监控服务已启动');
});
// 处理未捕获的异常
process.on('uncaughtException', (error) => {
    logger_1.default.error('未捕获的异常:', error);
    // 继续运行
});
// 处理未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('未处理的Promise拒绝:', reason);
    // 继续运行
});
// 处理退出信号
process.on('SIGTERM', () => {
    logger_1.default.info('收到SIGTERM信号，正在优雅关闭...');
    server.close(() => {
        logger_1.default.info('服务器已关闭');
        process.exit(0);
    });
});
//# sourceMappingURL=index.js.map