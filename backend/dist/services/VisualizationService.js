"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const logger_1 = __importDefault(require("../utils/logger"));
const fileUtils_1 = __importDefault(require("../utils/fileUtils"));
// 异步文件操作
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
// 可视化配置保存目录
const visualizationsDir = process.env.VISUALIZATIONS_DIR || path_1.default.join(__dirname, '../../data/visualizations');
/**
 * 可视化配置服务，用于管理可视化配置
 */
class VisualizationService {
    constructor() {
        this.eventListeners = {};
        this.init();
    }
    /**
     * 初始化服务
     */
    async init() {
        try {
            // 确保目录存在
            await fileUtils_1.default.ensureDirectoryExists(visualizationsDir);
            logger_1.default.info('可视化配置目录已初始化');
        }
        catch (err) {
            logger_1.default.error('初始化可视化配置目录失败', err);
        }
    }
    /**
     * 获取文件的所有可视化配置
     * @param fileId 文件ID
     * @returns 可视化配置数组
     */
    async getVisualizations(fileId) {
        try {
            const filePath = this.getVisualizationFilePath(fileId);
            // 检查文件是否存在
            try {
                await fileUtils_1.default.statAsync(filePath);
            }
            catch (err) {
                // 文件不存在，返回空数组
                return [];
            }
            // 读取文件内容
            const data = await readFileAsync(filePath, 'utf8');
            return JSON.parse(data);
        }
        catch (err) {
            logger_1.default.error(`获取可视化配置失败: ${fileId}`, err);
            return [];
        }
    }
    /**
     * 创建新的可视化配置
     * @param fileId 文件ID
     * @param config 可视化配置
     * @returns 创建的可视化配置
     */
    async createVisualization(fileId, config) {
        try {
            // 获取当前配置
            const visualizations = await this.getVisualizations(fileId);
            // 添加ID
            const newConfig = {
                ...config,
                id: (0, uuid_1.v4)()
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
        }
        catch (err) {
            logger_1.default.error(`创建可视化配置失败: ${fileId}`, err);
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
    async updateVisualization(fileId, visId, config) {
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
        }
        catch (err) {
            logger_1.default.error(`更新可视化配置失败: ${fileId}, ${visId}`, err);
            throw err;
        }
    }
    /**
     * 删除可视化配置
     * @param fileId 文件ID
     * @param visId 可视化配置ID
     */
    async deleteVisualization(fileId, visId) {
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
        }
        catch (err) {
            logger_1.default.error(`删除可视化配置失败: ${fileId}, ${visId}`, err);
            throw err;
        }
    }
    /**
     * 保存可视化配置
     * @param fileId 文件ID
     * @param visualizations 可视化配置数组
     */
    async saveVisualizations(fileId, visualizations) {
        try {
            const filePath = this.getVisualizationFilePath(fileId);
            // 确保目录存在
            await fileUtils_1.default.ensureDirectoryExists(visualizationsDir);
            // 写入文件
            await writeFileAsync(filePath, JSON.stringify(visualizations, null, 2), 'utf8');
            logger_1.default.info(`可视化配置已保存: ${fileId}`);
        }
        catch (err) {
            logger_1.default.error(`保存可视化配置失败: ${fileId}`, err);
            throw err;
        }
    }
    /**
     * 获取可视化配置文件路径
     * @param fileId 文件ID
     * @returns 文件路径
     */
    getVisualizationFilePath(fileId) {
        return path_1.default.join(visualizationsDir, `${fileId}.json`);
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
exports.default = new VisualizationService();
//# sourceMappingURL=VisualizationService.js.map