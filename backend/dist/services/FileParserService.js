"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
const papaparse_1 = __importDefault(require("papaparse"));
const logger_1 = __importDefault(require("../utils/logger"));
const fileUtils_1 = __importDefault(require("../utils/fileUtils"));
/**
 * 文件解析服务，用于解析不同格式的表格文件
 */
class FileParserService {
    /**
     * 解析文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    async parseFile(filePath) {
        try {
            const ext = fileUtils_1.default.getFileExtension(filePath);
            const stats = await fileUtils_1.default.statAsync(filePath);
            // 根据文件类型解析
            let data;
            switch (ext) {
                case '.csv':
                    data = await this.parseCSV(filePath);
                    break;
                case '.xlsx':
                case '.xls':
                    data = await this.parseExcel(filePath);
                    break;
                case '.json':
                    data = await this.parseJSON(filePath);
                    break;
                default:
                    throw new Error(`不支持的文件类型: ${ext}`);
            }
            // 添加文件元数据
            data.metadata = {
                ...data.metadata,
                fileName: path_1.default.basename(filePath),
                fileType: ext.replace('.', ''),
                lastModified: stats.mtime,
                filePath: filePath,
                fileSize: stats.size
            };
            return data;
        }
        catch (err) {
            logger_1.default.error(`解析文件失败: ${filePath}`, err);
            throw err;
        }
    }
    /**
     * 解析CSV文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    async parseCSV(filePath) {
        try {
            const fileContent = await fileUtils_1.default.readFileAsync(filePath, 'utf8');
            // 使用PapaParse解析CSV
            const result = papaparse_1.default.parse(fileContent, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true
            });
            // 使用类型断言处理解析结果
            const parsedData = result.data;
            // 构建表头
            const headers = this.generateHeaders(parsedData[0]);
            return {
                headers,
                rows: parsedData,
                metadata: {
                    fileName: path_1.default.basename(filePath),
                    fileType: 'csv',
                    lastModified: new Date(),
                    rowCount: parsedData.length
                }
            };
        }
        catch (err) {
            logger_1.default.error(`解析CSV文件失败: ${filePath}`, err);
            throw err;
        }
    }
    /**
     * 解析Excel文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    async parseExcel(filePath) {
        try {
            // 读取Excel文件
            const workbook = xlsx_1.default.readFile(filePath, {
                type: 'file',
                cellDates: true, // 将日期解析为实际日期对象
                cellNF: false, // 不保留数字格式
                cellText: false // 不生成文本
            });
            if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('Excel文件无效或为空');
            }
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            if (!worksheet) {
                throw new Error('无法读取Excel工作表');
            }
            // 转换为JSON
            const rawData = xlsx_1.default.utils.sheet_to_json(worksheet, {
                dateNF: 'yyyy-mm-dd', // 日期格式
                defval: null, // 空单元格的默认值
                blankrows: false // 忽略空行
            });
            if (!Array.isArray(rawData) || rawData.length === 0) {
                throw new Error('Excel数据为空或格式不正确');
            }
            // 使用类型断言处理解析结果
            const data = rawData;
            // 构建表头
            const headers = this.generateHeaders(data[0]);
            if (headers.length === 0) {
                throw new Error('无法从Excel提取表头');
            }
            return {
                headers,
                rows: data,
                metadata: {
                    fileName: path_1.default.basename(filePath),
                    fileType: 'excel',
                    lastModified: new Date(),
                    rowCount: data.length
                }
            };
        }
        catch (err) {
            logger_1.default.error(`解析Excel文件失败: ${filePath}`, err);
            throw err;
        }
    }
    /**
     * 解析JSON文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    async parseJSON(filePath) {
        try {
            const fileContent = await fileUtils_1.default.readFileAsync(filePath, 'utf8');
            const jsonData = JSON.parse(fileContent);
            // 确保数据是数组
            const rows = Array.isArray(jsonData) ? jsonData : [jsonData];
            const typedRows = rows;
            // 构建表头
            const headers = this.generateHeaders(typedRows[0]);
            return {
                headers,
                rows: typedRows,
                metadata: {
                    fileName: path_1.default.basename(filePath),
                    fileType: 'json',
                    lastModified: new Date(),
                    rowCount: typedRows.length
                }
            };
        }
        catch (err) {
            logger_1.default.error(`解析JSON文件失败: ${filePath}`, err);
            throw err;
        }
    }
    /**
     * 根据数据生成表头
     * @param row 第一行数据
     * @returns 表头数组
     */
    generateHeaders(row) {
        if (!row)
            return [];
        return Object.keys(row).map(key => {
            const value = row[key];
            let type = 'string';
            // 判断数据类型
            if (typeof value === 'number') {
                type = 'number';
            }
            else if (value instanceof Date) {
                type = 'date';
            }
            else if (typeof value === 'boolean') {
                type = 'boolean';
            }
            else if (typeof value === 'string') {
                // 尝试转换日期字符串
                const datePattern = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
                if (datePattern.test(value)) {
                    type = 'date';
                }
                // 尝试转换数字字符串
                else if (!isNaN(Number(value)) && value.trim() !== '') {
                    type = 'number';
                }
            }
            return {
                key,
                label: key,
                type,
                sortable: true,
                filterable: true
            };
        });
    }
}
// 单例模式
exports.default = new FileParserService();
//# sourceMappingURL=FileParserService.js.map