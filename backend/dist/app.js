"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = __importDefault(require("./utils/logger"));
// 加载环境变量
dotenv_1.default.config();
// 创建Express应用
const app = (0, express_1.default)();
// 配置跨域
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
// 安全中间件
app.use((0, helmet_1.default)());
// 日志中间件
app.use((0, morgan_1.default)('dev', {
    stream: {
        write: (message) => {
            logger_1.default.info(message.trim());
        }
    }
}));
// 请求体解析
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 静态文件
app.use('/static', express_1.default.static(path_1.default.join(__dirname, '../public')));
// API路由
app.use('/api', routes_1.default);
// 健康检查 - API 路由
app.get('/api/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});
// 保留原来的健康检查路径，以确保兼容性
app.get('/health', (req, res) => {
    res.json({ status: 'UP', timestamp: new Date() });
});
// 错误处理
app.use((err, req, res, next) => {
    logger_1.default.error('未处理的错误:', err);
    res.status(500).json({
        code: 500,
        message: '服务器内部错误',
        data: null
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map