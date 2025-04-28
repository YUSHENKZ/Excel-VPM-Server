import { Request, Response } from 'express';
import path from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import fileUtils from '../utils/fileUtils';
import responseUtils from '../utils/responseUtils';
import fileParserService from '../services/FileParserService';
import configService from '../services/ConfigService';

// 获取文件上传目录
const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
const dataDir = process.env.DATA_DIR || path.join(__dirname, '../../data');

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // 首先确保数据目录存在
    await fileUtils.ensureDirectoryExists(dataDir);
    cb(null, dataDir);
  },
  filename: (req, file, cb) => {
    // 记录原始文件名，帮助调试可能的编码问题
    logger.info(`收到原始文件名: "${file.originalname}"`);
    
    const uniqueName = fileUtils.generateUniqueFileName(file.originalname);
    logger.info(`生成的唯一文件名: "${uniqueName}"`);
    
    cb(null, uniqueName);
  }
});

// 过滤文件类型
const fileFilter = async (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 修复中文文件名编码问题
  file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
  logger.info(`修复编码后的文件名: "${file.originalname}"`);
  
  const config = await configService.getConfig();
  const supportedTypes = config.fileWatching.fileTypes;
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (supportedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${ext}. 支持的类型: ${supportedTypes.join(', ')}`));
  }
};

// 创建上传中间件
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 200 * 1024 * 1024 // 增加到200MB
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
  public async getFiles(req: Request, res: Response) {
    try {
      // 获取路径参数
      let dirPath = req.query.path as string;
      logger.info(`接收到原始路径参数: "${dirPath}"`);
      
      const includeSubdirectories = req.query.includeSubdirectories !== 'false';
      
      // 处理前端传来的路径参数
      if (dirPath) {
        try {
          // 检查是否需要URL解码（如果参数包含%字符）
          if (dirPath.includes('%')) {
            const decodedPath = decodeURIComponent(dirPath);
            logger.info(`解码后的路径: "${decodedPath}"`);
            dirPath = decodedPath;
          }
          
          // 先规范化路径，然后统一替换为正斜杠（Windows下会使用反斜杠）
          let normalizedPath = path.normalize(dirPath);
          // 确保使用正斜杠（/）作为路径分隔符
          normalizedPath = normalizedPath.replace(/\\/g, '/');
          logger.info(`规范化后的路径(使用正斜杠): "${normalizedPath}"`);
          dirPath = normalizedPath;
        } catch (e: any) {
          logger.error(`路径参数处理失败: ${e.message}`);
          // 出错时使用原始路径，确保操作可以继续
        }
      }
      
      // 如果没有提供路径或路径是根目录标识
      if (!dirPath || dirPath === '/' || dirPath === '' || dirPath === '.') {
        logger.info(`使用默认数据目录作为根目录: "${dataDir}"`);
        dirPath = dataDir;
      } else {
        // 确保对于相对路径的正确处理
        if (!path.isAbsolute(dirPath)) {
          // 如果不是绝对路径，则拼接到默认数据目录
          // 使用path.join并确保结果使用正斜杠
          const absolutePath = path.join(dataDir, dirPath).replace(/\\/g, '/');
          logger.info(`将相对路径转换为绝对路径: "${absolutePath}"`);
          dirPath = absolutePath;
        }
      }
      
      logger.info(`最终读取目录: "${dirPath}"`);
      
      // 文件系统操作前转换路径分隔符为系统适用格式
      const systemPath = path.normalize(dirPath);
      logger.info(`系统路径格式: "${systemPath}"`);
      
      // 确保目录存在
      await fileUtils.ensureDirectoryExists(systemPath);
      
      // 读取目录内容，传入系统路径格式
      const files = await fileUtils.readDirectory(systemPath, includeSubdirectories);
      
      logger.info(`成功获取目录内容，文件数量: ${files.length}`);
      
      return responseUtils.success(res, files);
    } catch (err) {
      logger.error('获取文件列表失败', err);
      return responseUtils.serverError(res, `获取文件列表失败: ${(err as Error).message}`);
    }
  }
  
  /**
   * 获取文件内容
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async getFileContent(req: Request, res: Response) {
    try {
      const fileId = req.params.id;
      
      // 解码文件路径
      let filePath = '';
      try {
        logger.info(`尝试解码文件ID: ${fileId}`);
        // 先进行Base64解码，然后进行URL解码
        filePath = decodeURIComponent(Buffer.from(fileId, 'base64').toString());
        logger.info(`解码后的文件路径: ${filePath}`);
        
        // 确保使用正斜杠（/）作为路径分隔符（API文档要求）
        filePath = filePath.replace(/\\/g, '/');
        logger.info(`标准化路径分隔符: ${filePath}`);
      } catch (e) {
        logger.error(`无法解码文件ID: ${fileId}`, e);
        return responseUtils.error(res, `无效的文件ID: ${fileId}`);
      }
      
      // 文件系统操作前转换为系统路径格式
      const systemFilePath = path.normalize(filePath);
      logger.info(`系统路径格式: "${systemFilePath}"`);
      
      // 验证文件存在
      try {
        const stats = await fileUtils.statAsync(systemFilePath);
        logger.info(`文件统计信息: ${JSON.stringify({
          size: stats.size,
          isDirectory: stats.isDirectory(),
          mtime: stats.mtime
        })}`);
        
        if (stats.isDirectory()) {
          logger.error(`请求的路径是一个目录: ${filePath}`);
          return responseUtils.error(res, `无法读取目录内容作为文件`);
        }
      } catch (err) {
        logger.error(`文件不存在或无法访问: ${filePath}`, err);
        return responseUtils.notFound(res, `文件不存在或无法访问: ${path.basename(filePath)}`);
      }
      
      // 检查文件扩展名
      const ext = path.extname(filePath).toLowerCase();
      
      // 从配置中获取支持的文件类型，而不是硬编码
      const config = await configService.getConfig();
      const supportedTypes = config.fileWatching.fileTypes;
      
      if (!supportedTypes.includes(ext)) {
        logger.error(`不支持的文件类型: ${ext}`);
        return responseUtils.error(res, `不支持的文件类型: ${ext}. 支持的类型: ${supportedTypes.join(', ')}`);
      }
      
      // 解析文件
      try {
        logger.info(`开始解析文件: ${filePath}`);
        // 传入系统路径格式给解析服务
        const data = await fileParserService.parseFile(systemFilePath);
        
        if (!data || !data.rows || !data.headers) {
          logger.error(`文件解析失败，无法提取数据: ${filePath}`);
          return responseUtils.error(res, `文件解析失败，无法提取数据`);
        }
        
        logger.info(`文件解析成功: ${filePath}, 行数: ${data.rows.length}, 列数: ${data.headers.length}`);
        return responseUtils.success(res, data);
      } catch (parseErr) {
        logger.error(`文件解析失败: ${filePath}`, parseErr);
        return responseUtils.error(res, `文件解析失败: ${(parseErr as Error).message}`);
      }
    } catch (err) {
      logger.error('获取文件内容失败', err);
      return responseUtils.serverError(res, `获取文件内容失败: ${(err as Error).message}`);
    }
  }
  
  /**
   * 上传文件
   * @param req Express请求对象
   * @param res Express响应对象
   */
  public async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return responseUtils.error(res, '未提供文件');
      }
      
      const file = req.file;
      
      // 再次确保文件名编码正确（防止某些情况下fileFilter未生效）
      if (file.originalname.match(/[^\x00-\x7F]/)) { // 检查是否包含非ASCII字符
        const testChar = file.originalname.charAt(0);
        if (testChar.length === 1 && testChar.charCodeAt(0) > 127) {
          // 如果发现疑似编码问题，再次修复
          logger.info(`二次检查文件名编码: "${file.originalname}"`);
          file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
          logger.info(`二次修复后的文件名: "${file.originalname}"`);
        }
      }
      
      logger.info(`处理已上传文件: originalname="${file.originalname}", filename="${file.filename}"`);
      
      const filePath = path.join(dataDir, file.filename);
      logger.info(`完整文件路径: "${filePath}"`);
      
      // 获取文件信息
      const fileInfo = await fileUtils.getFileInfo(filePath);
      logger.info(`生成的文件信息: ${JSON.stringify(fileInfo)}`);
      
      // 触发文件变更事件
      const io = (global as any).io;
      if (io) {
        io.emit('file-change', { 
          type: 'add',
          path: dataDir,
          timestamp: new Date()
        });
      }
      
      return responseUtils.created(res, fileInfo, '文件上传成功');
    } catch (err) {
      logger.error('上传文件失败', err);
      return responseUtils.serverError(res, `上传文件失败: ${(err as Error).message}`);
    }
  }
}

export default new FileController(); 