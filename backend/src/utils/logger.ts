import winston from 'winston';
import path from 'path';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 获取日志目录
const logDir = process.env.LOGS_DIR || './logs';

// 创建日志格式
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// 创建日志记录器
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    logFormat
  ),
  defaultMeta: { service: 'table-visualizer' },
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    }),
    // 文件日志 - 所有级别
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    }),
    // 错误日志
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    })
  ]
});

export default logger; 