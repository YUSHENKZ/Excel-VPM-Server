"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const responseUtils_1 = __importDefault(require("../utils/responseUtils"));
const VisualizationService_1 = __importDefault(require("../services/VisualizationService"));
/**
 * 可视化控制器，处理可视化配置相关的API请求
 */
class VisualizationController {
    /**
     * 获取文件的所有可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async getVisualizations(req, res) {
        try {
            const fileId = req.params.id;
            if (!fileId) {
                return responseUtils_1.default.error(res, '未提供文件ID');
            }
            const visualizations = await VisualizationService_1.default.getVisualizations(fileId);
            return responseUtils_1.default.success(res, visualizations);
        }
        catch (err) {
            logger_1.default.error('获取可视化配置失败', err);
            return responseUtils_1.default.serverError(res, `获取可视化配置失败: ${err.message}`);
        }
    }
    /**
     * 创建新的可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async createVisualization(req, res) {
        try {
            const fileId = req.params.id;
            const config = req.body;
            if (!fileId) {
                return responseUtils_1.default.error(res, '未提供文件ID');
            }
            if (!config || typeof config !== 'object') {
                return responseUtils_1.default.error(res, '无效的可视化配置数据');
            }
            const newVisualization = await VisualizationService_1.default.createVisualization(fileId, config);
            return responseUtils_1.default.created(res, newVisualization, '可视化配置已创建');
        }
        catch (err) {
            logger_1.default.error('创建可视化配置失败', err);
            return responseUtils_1.default.serverError(res, `创建可视化配置失败: ${err.message}`);
        }
    }
    /**
     * 更新可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async updateVisualization(req, res) {
        try {
            const fileId = req.params.id;
            const visId = req.params.visId;
            const config = req.body;
            if (!fileId || !visId) {
                return responseUtils_1.default.error(res, '未提供文件ID或可视化配置ID');
            }
            if (!config || typeof config !== 'object') {
                return responseUtils_1.default.error(res, '无效的可视化配置数据');
            }
            const updatedVisualization = await VisualizationService_1.default.updateVisualization(fileId, visId, config);
            return responseUtils_1.default.success(res, updatedVisualization, '可视化配置已更新');
        }
        catch (err) {
            logger_1.default.error('更新可视化配置失败', err);
            // 如果是因为配置不存在导致的错误，返回404
            if (err.message.includes('不存在')) {
                return responseUtils_1.default.notFound(res, err.message);
            }
            return responseUtils_1.default.serverError(res, `更新可视化配置失败: ${err.message}`);
        }
    }
    /**
     * 删除可视化配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async deleteVisualization(req, res) {
        try {
            const fileId = req.params.id;
            const visId = req.params.visId;
            if (!fileId || !visId) {
                return responseUtils_1.default.error(res, '未提供文件ID或可视化配置ID');
            }
            await VisualizationService_1.default.deleteVisualization(fileId, visId);
            return responseUtils_1.default.success(res, null, '可视化配置已删除');
        }
        catch (err) {
            logger_1.default.error('删除可视化配置失败', err);
            // 如果是因为配置不存在导致的错误，返回404
            if (err.message.includes('不存在')) {
                return responseUtils_1.default.notFound(res, err.message);
            }
            return responseUtils_1.default.serverError(res, `删除可视化配置失败: ${err.message}`);
        }
    }
}
exports.default = new VisualizationController();
//# sourceMappingURL=VisualizationController.js.map