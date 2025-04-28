"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const logger_1 = __importDefault(require("../utils/logger"));
const fileUtils_1 = __importDefault(require("../utils/fileUtils"));
// 异步文件操作
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
// 环境变量中的配置文件路径
const configPath = process.env.CONFIG_PATH || path_1.default.join(__dirname, '../../config/config.json');
// 默认配置
const defaultConfig = {
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
    constructor() {
        this.eventListeners = {};
        this.config = { ...defaultConfig };
        this.init();
    }
    /**
     * 初始化配置
     */
    async init() {
        try {
            await this.loadConfig();
            logger_1.default.info('配置已加载');
        }
        catch (err) {
            logger_1.default.error('加载配置失败，使用默认配置', err);
            // 如果配置文件不存在，创建它
            await this.saveConfig(defaultConfig);
        }
    }
    /**
     * 从配置文件加载配置
     */
    async loadConfig() {
        try {
            // 确保目录存在
            const configDir = path_1.default.dirname(configPath);
            await fileUtils_1.default.ensureDirectoryExists(configDir);
            const data = await readFileAsync(configPath, 'utf8');
            this.config = JSON.parse(data);
            return this.config;
        }
        catch (err) {
            logger_1.default.error('读取配置文件失败', err);
            throw err;
        }
    }
    /**
     * 获取系统配置
     * @returns 系统配置
     */
    async getConfig() {
        return this.config;
    }
    /**
     * 更新系统配置
     * @param newConfig 新的配置
     * @returns 更新后的配置
     */
    async updateConfig(newConfig) {
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
    async saveConfig(config) {
        try {
            const configDir = path_1.default.dirname(configPath);
            await fileUtils_1.default.ensureDirectoryExists(configDir);
            await writeFileAsync(configPath, JSON.stringify(config, null, 2), 'utf8');
            logger_1.default.info('配置已保存');
        }
        catch (err) {
            logger_1.default.error('保存配置失败', err);
            throw err;
        }
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
exports.default = new ConfigService();
//# sourceMappingURL=ConfigService.js.map