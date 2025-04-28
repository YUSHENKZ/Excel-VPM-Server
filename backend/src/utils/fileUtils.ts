import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import logger from './logger';

// 文件系统操作的异步版本
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);
const mkdirAsync = promisify(fs.mkdir);

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await statAsync(dirPath);
  } catch (err) {
    // 目录不存在，创建它
    await mkdirAsync(dirPath, { recursive: true });
    logger.info(`目录已创建: ${dirPath}`);
  }
};

/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 文件扩展名，转换为小写
 */
export const getFileExtension = (filePath: string): string => {
  return path.extname(filePath).toLowerCase();
};

/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @returns 带UUID的唯一文件名
 */
export const generateUniqueFileName = (originalName: string): string => {
  // 先确保文件名编码正确，虽然在multer的fileFilter中已经处理过
  // 但这里作为最后一道保障再检查一遍
  // 注意：此时应该已经是正确的UTF-8编码，不需要再转换
  
  try {
    // 仅记录文件名用于调试，不进行额外处理
    logger.info(`生成唯一文件名，原始文件名: "${originalName}"`);
  } catch (e) {
    logger.error(`记录文件名时出错: ${e}`);
  }

  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  
  // 创建新的文件名，使用UUID确保唯一性
  return `${baseName}_${uuidv4()}${ext}`;
};

/**
 * 检查文件类型是否支持
 * @param filePath 文件路径
 * @param supportedExtensions 支持的扩展名数组
 * @returns 是否支持
 */
export const isSupportedFileType = (
  filePath: string,
  supportedExtensions: string[]
): boolean => {
  const ext = getFileExtension(filePath);
  return supportedExtensions.includes(ext);
};

/**
 * 获取文件信息
 * @param filePath 文件路径
 * @returns 文件信息对象
 */
export const getFileInfo = async (filePath: string) => {
  try {
    const stats = await statAsync(filePath);
    const ext = getFileExtension(filePath);
    const fileName = path.basename(filePath);
    
    // 将文件路径中的反斜杠替换为正斜杠，确保API一致性
    const apiPath = filePath.replace(/\\/g, '/');
    // 对规范化后的路径进行编码
    const encodedPath = encodeURIComponent(apiPath);
    const fileId = Buffer.from(encodedPath).toString('base64');
    
    return {
      id: fileId,
      name: fileName,
      path: apiPath,
      type: ext.replace('.', ''),
      size: stats.size,
      lastModified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch (err) {
    logger.error(`获取文件信息失败: ${filePath}`, err);
    throw err;
  }
};

/**
 * 读取目录内容
 * @param dirPath 目录路径
 * @param includeSubdirectories 是否包含子目录
 * @returns 文件信息数组
 */
export const readDirectory = async (
  dirPath: string,
  includeSubdirectories = true
) => {
  try {
    // 规范化路径
    const normalizedPath = path.normalize(dirPath);
    logger.info(`读取目录内容, 原始路径: ${dirPath}, 规范化路径: ${normalizedPath}`);
    
    await ensureDirectoryExists(normalizedPath);
    const files = await readdirAsync(normalizedPath);
    
    logger.info(`目录 ${normalizedPath} 中找到 ${files.length} 个文件/文件夹`);
    
    const fileInfoPromises = files.map(async (file) => {
      const fullPath = path.join(normalizedPath, file);
      try {
        const stats = await statAsync(fullPath);
        
        if (stats.isDirectory() && !includeSubdirectories) {
          return null;
        }
        
        // 对文件路径进行编码处理，确保Base64编码的ID可以被正确解码
        // 先将文件路径中的反斜杠替换为正斜杠，确保API一致性
        const apiPath = fullPath.replace(/\\/g, '/');
        const encodedPath = encodeURIComponent(apiPath);
        const fileId = Buffer.from(encodedPath).toString('base64');
        
        return {
          id: fileId,
          name: file,
          // 返回的路径统一使用正斜杠（符合API文档要求）
          path: apiPath,
          type: stats.isDirectory() ? 'directory' : getFileExtension(file).replace('.', ''),
          size: stats.size,
          lastModified: stats.mtime,
          isDirectory: stats.isDirectory()
        };
      } catch (statError) {
        logger.error(`无法获取文件信息: ${fullPath}`, statError);
        return null; // 跳过无法访问的文件
      }
    });
    
    const fileInfos = await Promise.all(fileInfoPromises);
    const validFileInfos = fileInfos.filter(info => info !== null);
    
    logger.info(`成功获取 ${validFileInfos.length} 个有效文件/文件夹信息`);
    return validFileInfos;
  } catch (err) {
    logger.error(`读取目录失败: ${dirPath}`, err);
    throw err;
  }
};

export default {
  ensureDirectoryExists,
  getFileExtension,
  generateUniqueFileName,
  isSupportedFileType,
  getFileInfo,
  readDirectory,
  readFileAsync,
  writeFileAsync,
  statAsync
}; 