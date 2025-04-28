"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const logger_1 = __importDefault(require("../utils/logger"));
const ConfigService_1 = __importDefault(require("./ConfigService"));
const fileUtils_1 = __importDefault(require("../utils/fileUtils"));
/**
 * 文件监控服务，用于监控文件变化
 */
class FileWatcherService {
    constructor() {
        this.watchers = [];
        this.eventListeners = {};
        this.config = null;
        this.init();
    }
    /**
     * 初始化服务
     */
    async init() {
        // 加载配置
        this.config = await ConfigService_1.default.getConfig();
        // 监听配置变更
        ConfigService_1.default.on('config-change', (config) => {
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
    async startWatchers() {
        if (!this.config)
            return;
        // 清除现有监控
        this.stopWatchers();
        const { directories, fileTypes } = this.config.fileWatching;
        // 确保目录存在
        for (const dir of directories) {
            await fileUtils_1.default.ensureDirectoryExists(dir);
        }
        // 创建监控器
        const watcher = chokidar_1.default.watch(directories, {
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
                logger_1.default.info(`文件添加: ${filePath}`);
                this.emit('file-change', {
                    type: 'add',
                    path: filePath
                });
            }
        });
        // 文件修改事件
        watcher.on('change', (filePath) => {
            if (this.isWatchedFileType(filePath, fileTypes)) {
                logger_1.default.info(`文件修改: ${filePath}`);
                this.emit('file-change', {
                    type: 'change',
                    path: filePath
                });
            }
        });
        // 文件删除事件
        watcher.on('unlink', (filePath) => {
            if (this.isWatchedFileType(filePath, fileTypes)) {
                logger_1.default.info(`文件删除: ${filePath}`);
                this.emit('file-change', {
                    type: 'unlink',
                    path: filePath
                });
            }
        });
        // 错误事件
        watcher.on('error', (error) => {
            logger_1.default.error('文件监控错误:', error);
        });
        // 就绪事件
        watcher.on('ready', () => {
            logger_1.default.info('文件监控已启动');
        });
        this.watchers.push(watcher);
    }
    /**
     * 停止文件监控
     */
    stopWatchers() {
        this.watchers.forEach(watcher => {
            watcher.close();
        });
        this.watchers = [];
    }
    /**
     * 重启文件监控
     */
    restartWatchers() {
        this.stopWatchers();
        this.startWatchers();
    }
    /**
     * 检查文件类型是否被监控
     * @param filePath 文件路径
     * @param fileTypes 监控的文件类型
     * @returns 是否被监控
     */
    isWatchedFileType(filePath, fileTypes) {
        const ext = fileUtils_1.default.getFileExtension(filePath);
        return fileTypes.includes(ext);
    }
    /**
     * 注册事件监听器
     * @param event 事件名称
     * @param callback 回调函数
     */
    on(event, callback) {
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
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(callback => callback(data));
        }
    }
}
// 单例模式
exports.default = new FileWatcherService();
//# sourceMappingURL=FileWatcherService.js.map