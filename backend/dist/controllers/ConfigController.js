"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const responseUtils_1 = __importDefault(require("../utils/responseUtils"));
const ConfigService_1 = __importDefault(require("../services/ConfigService"));
/**
 * 配置控制器，处理配置相关的API请求
 */
class ConfigController {
    /**
     * 获取系统配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async getConfig(req, res) {
        try {
            const config = await ConfigService_1.default.getConfig();
            return responseUtils_1.default.success(res, config);
        }
        catch (err) {
            logger_1.default.error('获取配置失败', err);
            return responseUtils_1.default.serverError(res, `获取配置失败: ${err.message}`);
        }
    }
    /**
     * 更新系统配置
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async updateConfig(req, res) {
        try {
            const newConfig = req.body;
            // 验证配置
            if (!newConfig || typeof newConfig !== 'object') {
                return responseUtils_1.default.error(res, '无效的配置数据');
            }
            const updatedConfig = await ConfigService_1.default.updateConfig(newConfig);
            return responseUtils_1.default.success(res, updatedConfig, '配置已更新');
        }
        catch (err) {
            logger_1.default.error('更新配置失败', err);
            return responseUtils_1.default.serverError(res, `更新配置失败: ${err.message}`);
        }
    }
}
exports.default = new ConfigController();
//# sourceMappingURL=ConfigController.js.map