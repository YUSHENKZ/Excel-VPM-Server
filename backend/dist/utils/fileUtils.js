"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readDirectory = exports.getFileInfo = exports.isSupportedFileType = exports.generateUniqueFileName = exports.getFileExtension = exports.ensureDirectoryExists = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const util_1 = require("util");
const logger_1 = __importDefault(require("./logger"));
// 文件系统操作的异步版本
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
const writeFileAsync = (0, util_1.promisify)(fs_1.default.writeFile);
const statAsync = (0, util_1.promisify)(fs_1.default.stat);
const readdirAsync = (0, util_1.promisify)(fs_1.default.readdir);
const mkdirAsync = (0, util_1.promisify)(fs_1.default.mkdir);
/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
const ensureDirectoryExists = async (dirPath) => {
    try {
        await statAsync(dirPath);
    }
    catch (err) {
        // 目录不存在，创建它
        await mkdirAsync(dirPath, { recursive: true });
        logger_1.default.info(`目录已创建: ${dirPath}`);
    }
};
exports.ensureDirectoryExists = ensureDirectoryExists;
/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 文件扩展名，转换为小写
 */
const getFileExtension = (filePath) => {
    return path_1.default.extname(filePath).toLowerCase();
};
exports.getFileExtension = getFileExtension;
/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @returns 带UUID的唯一文件名
 */
const generateUniqueFileName = (originalName) => {
    const ext = path_1.default.extname(originalName);
    const baseName = path_1.default.basename(originalName, ext);
    return `${baseName}_${(0, uuid_1.v4)()}${ext}`;
};
exports.generateUniqueFileName = generateUniqueFileName;
/**
 * 检查文件类型是否支持
 * @param filePath 文件路径
 * @param supportedExtensions 支持的扩展名数组
 * @returns 是否支持
 */
const isSupportedFileType = (filePath, supportedExtensions) => {
    const ext = (0, exports.getFileExtension)(filePath);
    return supportedExtensions.includes(ext);
};
exports.isSupportedFileType = isSupportedFileType;
/**
 * 获取文件信息
 * @param filePath 文件路径
 * @returns 文件信息对象
 */
const getFileInfo = async (filePath) => {
    try {
        const stats = await statAsync(filePath);
        const ext = (0, exports.getFileExtension)(filePath);
        const fileName = path_1.default.basename(filePath);
        return {
            id: Buffer.from(filePath).toString('base64'),
            name: fileName,
            path: filePath,
            type: ext.replace('.', ''),
            size: stats.size,
            lastModified: stats.mtime,
            isDirectory: stats.isDirectory()
        };
    }
    catch (err) {
        logger_1.default.error(`获取文件信息失败: ${filePath}`, err);
        throw err;
    }
};
exports.getFileInfo = getFileInfo;
/**
 * 读取目录内容
 * @param dirPath 目录路径
 * @param includeSubdirectories 是否包含子目录
 * @returns 文件信息数组
 */
const readDirectory = async (dirPath, includeSubdirectories = true) => {
    try {
        await (0, exports.ensureDirectoryExists)(dirPath);
        const files = await readdirAsync(dirPath);
        const fileInfoPromises = files.map(async (file) => {
            const fullPath = path_1.default.join(dirPath, file);
            const stats = await statAsync(fullPath);
            if (stats.isDirectory() && !includeSubdirectories) {
                return null;
            }
            return {
                id: Buffer.from(fullPath).toString('base64'),
                name: file,
                path: fullPath,
                type: stats.isDirectory() ? 'directory' : (0, exports.getFileExtension)(file).replace('.', ''),
                size: stats.size,
                lastModified: stats.mtime,
                isDirectory: stats.isDirectory()
            };
        });
        const fileInfos = await Promise.all(fileInfoPromises);
        return fileInfos.filter(info => info !== null);
    }
    catch (err) {
        logger_1.default.error(`读取目录失败: ${dirPath}`, err);
        throw err;
    }
};
exports.readDirectory = readDirectory;
exports.default = {
    ensureDirectoryExists: exports.ensureDirectoryExists,
    getFileExtension: exports.getFileExtension,
    generateUniqueFileName: exports.generateUniqueFileName,
    isSupportedFileType: exports.isSupportedFileType,
    getFileInfo: exports.getFileInfo,
    readDirectory: exports.readDirectory,
    readFileAsync,
    writeFileAsync,
    statAsync
};
//# sourceMappingURL=fileUtils.js.map