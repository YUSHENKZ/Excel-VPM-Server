"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const logger_1 = __importDefault(require("../utils/logger"));
const fileUtils_1 = __importDefault(require("../utils/fileUtils"));
const responseUtils_1 = __importDefault(require("../utils/responseUtils"));
const FileParserService_1 = __importDefault(require("../services/FileParserService"));
const ConfigService_1 = __importDefault(require("../services/ConfigService"));
// 获取文件上传目录
const uploadsDir = process.env.UPLOADS_DIR || path_1.default.join(__dirname, '../../uploads');
const dataDir = process.env.DATA_DIR || path_1.default.join(__dirname, '../../data');
// 配置文件上传
const storage = multer_1.default.diskStorage({
    destination: async (req, file, cb) => {
        // 首先确保数据目录存在
        await fileUtils_1.default.ensureDirectoryExists(dataDir);
        cb(null, dataDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = fileUtils_1.default.generateUniqueFileName(file.originalname);
        cb(null, uniqueName);
    }
});
// 过滤文件类型
const fileFilter = async (req, file, cb) => {
    const config = await ConfigService_1.default.getConfig();
    const supportedTypes = config.fileWatching.fileTypes;
    const ext = path_1.default.extname(file.originalname).toLowerCase();
    if (supportedTypes.includes(ext)) {
        cb(null, true);
    }
    else {
        cb(new Error(`不支持的文件类型: ${ext}. 支持的类型: ${supportedTypes.join(', ')}`));
    }
};
// 创建上传中间件
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});
/**
 * 文件控制器，处理文件相关的API请求
 */
class FileController {
    /**
     * 获取文件列表
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async getFiles(req, res) {
        try {
            let dirPath = req.query.path;
            const includeSubdirectories = req.query.includeSubdirectories !== 'false';
            // 如果没有提供路径或路径是根目录标识，则使用dataDir
            if (!dirPath || dirPath === '/' || dirPath === '') {
                dirPath = dataDir;
            }
            logger_1.default.info(`读取目录: ${dirPath}`);
            // 确保目录存在
            await fileUtils_1.default.ensureDirectoryExists(dirPath);
            const files = await fileUtils_1.default.readDirectory(dirPath, includeSubdirectories);
            logger_1.default.info(`成功获取目录内容，文件数量: ${files.length}`);
            return responseUtils_1.default.success(res, files);
        }
        catch (err) {
            logger_1.default.error('获取文件列表失败', err);
            return responseUtils_1.default.serverError(res, `获取文件列表失败: ${err.message}`);
        }
    }
    /**
     * 获取文件内容
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async getFileContent(req, res) {
        try {
            const fileId = req.params.id;
            // 解码文件路径
            let filePath = '';
            try {
                filePath = Buffer.from(fileId, 'base64').toString();
            }
            catch (e) {
                return responseUtils_1.default.error(res, `无效的文件ID: ${fileId}`);
            }
            logger_1.default.info(`正在读取文件: ${filePath}`);
            // 验证文件存在
            try {
                await fileUtils_1.default.statAsync(filePath);
            }
            catch (err) {
                logger_1.default.error(`文件不存在: ${filePath}`, err);
                return responseUtils_1.default.notFound(res, `文件不存在: ${path_1.default.basename(filePath)}`);
            }
            // 检查文件扩展名
            const ext = path_1.default.extname(filePath).toLowerCase();
            const supportedTypes = ['.csv', '.xlsx', '.xls', '.json'];
            if (!supportedTypes.includes(ext)) {
                logger_1.default.error(`不支持的文件类型: ${ext}`);
                return responseUtils_1.default.error(res, `不支持的文件类型: ${ext}. 支持的类型: ${supportedTypes.join(', ')}`);
            }
            // 解析文件
            try {
                const data = await FileParserService_1.default.parseFile(filePath);
                if (!data || !data.rows || !data.headers) {
                    logger_1.default.error(`文件解析失败，无法提取数据: ${filePath}`);
                    return responseUtils_1.default.error(res, `文件解析失败，无法提取数据`);
                }
                logger_1.default.info(`文件解析成功: ${filePath}, 行数: ${data.rows.length}`);
                return responseUtils_1.default.success(res, data);
            }
            catch (parseErr) {
                logger_1.default.error(`文件解析失败: ${filePath}`, parseErr);
                return responseUtils_1.default.error(res, `文件解析失败: ${parseErr.message}`);
            }
        }
        catch (err) {
            logger_1.default.error('获取文件内容失败', err);
            return responseUtils_1.default.serverError(res, `获取文件内容失败: ${err.message}`);
        }
    }
    /**
     * 上传文件
     * @param req Express请求对象
     * @param res Express响应对象
     */
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return responseUtils_1.default.error(res, '未提供文件');
            }
            const file = req.file;
            const filePath = path_1.default.join(dataDir, file.filename);
            logger_1.default.info(`文件已上传: ${filePath}`);
            // 获取文件信息
            const fileInfo = await fileUtils_1.default.getFileInfo(filePath);
            // 触发文件变更事件
            const io = global.io;
            if (io) {
                io.emit('file-change', {
                    type: 'add',
                    path: dataDir,
                    timestamp: new Date()
                });
            }
            return responseUtils_1.default.created(res, fileInfo, '文件上传成功');
        }
        catch (err) {
            logger_1.default.error('上传文件失败', err);
            return responseUtils_1.default.serverError(res, `上传文件失败: ${err.message}`);
        }
    }
}
exports.default = new FileController();
//# sourceMappingURL=FileController.js.map