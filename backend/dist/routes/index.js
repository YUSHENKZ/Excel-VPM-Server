"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const files_1 = __importDefault(require("./files"));
const config_1 = __importDefault(require("./config"));
const router = express_1.default.Router();
// 文件相关路由
router.use('/files', files_1.default);
// 配置相关路由
router.use('/config', config_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map