"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const logger_1 = __importDefault(require("../utils/logger"));
const FileWatcherService_1 = __importDefault(require("../services/FileWatcherService"));
const ConfigService_1 = __importDefault(require("../services/ConfigService"));
const VisualizationService_1 = __importDefault(require("../services/VisualizationService"));
/**
 * WebSocket控制器，处理WebSocket连接和事件
 */
class WebSocketController {
    constructor() {
        this.io = null;
    }
    /**
     * 初始化WebSocket服务器
     * @param server HTTP服务器实例
     */
    init(server) {
        this.io = new socket_io_1.Server(server, {
            path: '/socket.io',
            cors: {
                origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });
        // 连接事件
        this.io.on('connection', (socket) => {
            const clientId = socket.id;
            logger_1.default.info(`WebSocket客户端连接: ${clientId}`);
            // 断开连接事件
            socket.on('disconnect', () => {
                logger_1.default.info(`WebSocket客户端断开连接: ${clientId}`);
            });
            // 错误事件
            socket.on('error', (error) => {
                logger_1.default.error(`WebSocket错误: ${clientId}`, error);
            });
        });
        // 监听文件变化事件
        this.setupFileChangeListener();
        // 监听配置变化事件
        this.setupConfigChangeListener();
        // 监听可视化配置变化事件
        this.setupVisualizationChangeListener();
        logger_1.default.info('WebSocket服务已初始化');
    }
    /**
     * 设置文件变化监听器
     */
    setupFileChangeListener() {
        FileWatcherService_1.default.on('file-change', (data) => {
            if (this.io) {
                this.io.emit('file-change', data);
                logger_1.default.info(`文件变化事件已广播: ${data.type}, ${data.path}`);
            }
        });
    }
    /**
     * 设置配置变化监听器
     */
    setupConfigChangeListener() {
        ConfigService_1.default.on('config-change', (data) => {
            if (this.io) {
                this.io.emit('config-change', data);
                logger_1.default.info('配置变化事件已广播');
            }
        });
    }
    /**
     * 设置可视化配置变化监听器
     */
    setupVisualizationChangeListener() {
        VisualizationService_1.default.on('visualization-change', (data) => {
            if (this.io) {
                this.io.emit('visualization-change', data);
                logger_1.default.info(`可视化配置变化事件已广播: ${data.type}, 文件ID: ${data.fileId}`);
            }
        });
    }
}
exports.default = new WebSocketController();
//# sourceMappingURL=WebSocketController.js.map