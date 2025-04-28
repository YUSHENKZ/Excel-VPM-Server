import fs from 'fs';
/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export declare const ensureDirectoryExists: (dirPath: string) => Promise<void>;
/**
 * 获取文件扩展名
 * @param filePath 文件路径
 * @returns 文件扩展名，转换为小写
 */
export declare const getFileExtension: (filePath: string) => string;
/**
 * 生成唯一文件名
 * @param originalName 原始文件名
 * @returns 带UUID的唯一文件名
 */
export declare const generateUniqueFileName: (originalName: string) => string;
/**
 * 检查文件类型是否支持
 * @param filePath 文件路径
 * @param supportedExtensions 支持的扩展名数组
 * @returns 是否支持
 */
export declare const isSupportedFileType: (filePath: string, supportedExtensions: string[]) => boolean;
/**
 * 获取文件信息
 * @param filePath 文件路径
 * @returns 文件信息对象
 */
export declare const getFileInfo: (filePath: string) => Promise<{
    id: string;
    name: string;
    path: string;
    type: string;
    size: number;
    lastModified: Date;
    isDirectory: boolean;
}>;
/**
 * 读取目录内容
 * @param dirPath 目录路径
 * @param includeSubdirectories 是否包含子目录
 * @returns 文件信息数组
 */
export declare const readDirectory: (dirPath: string, includeSubdirectories?: boolean) => Promise<{
    id: string;
    name: string;
    path: string;
    type: string;
    size: number;
    lastModified: Date;
    isDirectory: boolean;
}[]>;
declare const _default: {
    ensureDirectoryExists: (dirPath: string) => Promise<void>;
    getFileExtension: (filePath: string) => string;
    generateUniqueFileName: (originalName: string) => string;
    isSupportedFileType: (filePath: string, supportedExtensions: string[]) => boolean;
    getFileInfo: (filePath: string) => Promise<{
        id: string;
        name: string;
        path: string;
        type: string;
        size: number;
        lastModified: Date;
        isDirectory: boolean;
    }>;
    readDirectory: (dirPath: string, includeSubdirectories?: boolean) => Promise<{
        id: string;
        name: string;
        path: string;
        type: string;
        size: number;
        lastModified: Date;
        isDirectory: boolean;
    }[]>;
    readFileAsync: typeof fs.readFile.__promisify__;
    writeFileAsync: typeof fs.writeFile.__promisify__;
    statAsync: typeof fs.stat.__promisify__;
};
export default _default;
