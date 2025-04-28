"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// 加载环境变量
dotenv_1.default.config();
// 获取日志目录
const logDir = process.env.LOGS_DIR || './logs';
// 创建日志格式
const logFormat = winston_1.default.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
// 创建日志记录器
const logger = winston_1.default.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), logFormat),
    defaultMeta: { service: 'table-visualizer' },
    transports: [
        // 控制台输出
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
        }),
        // 文件日志 - 所有级别
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'combined.log')
        }),
        // 错误日志
        new winston_1.default.transports.File({
            filename: path_1.default.join(logDir, 'error.log'),
            level: 'error'
        })
    ]
});
exports.default = logger;
//# sourceMappingURL=logger.js.map