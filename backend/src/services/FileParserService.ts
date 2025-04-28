import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import Papa from 'papaparse';
import { TableData, TableHeader } from '../models';
import logger from '../utils/logger';
import fileUtils from '../utils/fileUtils';

/**
 * 文件解析服务，用于解析不同格式的表格文件
 */
class FileParserService {
  /**
   * 解析文件
   * @param filePath 文件路径
   * @returns 表格数据
   */
  public async parseFile(filePath: string): Promise<TableData> {
    try {
      const ext = fileUtils.getFileExtension(filePath);
      const stats = await fileUtils.statAsync(filePath);
      
      // 根据文件类型解析
      let data: TableData;
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
        fileName: path.basename(filePath),
        fileType: ext.replace('.', ''),
        lastModified: stats.mtime,
        filePath: filePath,
        fileSize: stats.size
      };
      
      return data;
    } catch (err) {
      logger.error(`解析文件失败: ${filePath}`, err);
      throw err;
    }
  }
  
  /**
   * 解析CSV文件
   * @param filePath 文件路径
   * @returns 表格数据
   */
  private async parseCSV(filePath: string): Promise<TableData> {
    try {
      const fileContent = await fileUtils.readFileAsync(filePath, 'utf8');
      
      // 使用PapaParse解析CSV
      const result = Papa.parse(fileContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      // 使用类型断言处理解析结果
      const parsedData = result.data as Record<string, any>[];
      
      // 构建表头
      const headers = this.generateHeaders(parsedData[0] as Record<string, any>);
      
      return {
        headers,
        rows: parsedData,
        metadata: {
          fileName: path.basename(filePath),
          fileType: 'csv',
          lastModified: new Date(),
          rowCount: parsedData.length
        }
      };
    } catch (err) {
      logger.error(`解析CSV文件失败: ${filePath}`, err);
      throw err;
    }
  }
  
  /**
   * 解析Excel文件
   * @param filePath 文件路径
   * @returns 表格数据
   */
  private async parseExcel(filePath: string): Promise<TableData> {
    try {
      // 读取Excel文件
      const workbook = xlsx.readFile(filePath, { 
        type: 'file',
        cellDates: true, // 将日期解析为实际日期对象
        cellNF: false,   // 不保留数字格式
        cellText: false  // 不生成文本
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
      const rawData = xlsx.utils.sheet_to_json(worksheet, {
        dateNF: 'yyyy-mm-dd', // 日期格式
        defval: null,         // 空单元格的默认值
        blankrows: false      // 忽略空行
      });
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('Excel数据为空或格式不正确');
      }
      
      // 使用类型断言处理解析结果
      const data = rawData as Record<string, any>[];
      
      // 构建表头
      const headers = this.generateHeaders(data[0] as Record<string, any>);
      
      if (headers.length === 0) {
        throw new Error('无法从Excel提取表头');
      }
      
      return {
        headers,
        rows: data,
        metadata: {
          fileName: path.basename(filePath),
          fileType: 'excel',
          lastModified: new Date(),
          rowCount: data.length
        }
      };
    } catch (err) {
      logger.error(`解析Excel文件失败: ${filePath}`, err);
      throw err;
    }
  }
  
  /**
   * 解析JSON文件
   * @param filePath 文件路径
   * @returns 表格数据
   */
  private async parseJSON(filePath: string): Promise<TableData> {
    try {
      const fileContent = await fileUtils.readFileAsync(filePath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      // 确保数据是数组
      const rows = Array.isArray(jsonData) ? jsonData : [jsonData];
      const typedRows = rows as Record<string, any>[];
      
      // 构建表头
      const headers = this.generateHeaders(typedRows[0] as Record<string, any>);
      
      return {
        headers,
        rows: typedRows,
        metadata: {
          fileName: path.basename(filePath),
          fileType: 'json',
          lastModified: new Date(),
          rowCount: typedRows.length
        }
      };
    } catch (err) {
      logger.error(`解析JSON文件失败: ${filePath}`, err);
      throw err;
    }
  }
  
  /**
   * 根据数据生成表头
   * @param row 第一行数据
   * @returns 表头数组
   */
  private generateHeaders(row: Record<string, any>): TableHeader[] {
    if (!row) return [];
    
    return Object.keys(row).map(key => {
      const value = row[key];
      let type: 'string' | 'number' | 'date' | 'boolean' = 'string';
      
      // 判断数据类型
      if (typeof value === 'number') {
        type = 'number';
      } else if (value instanceof Date) {
        type = 'date';
      } else if (typeof value === 'boolean') {
        type = 'boolean';
      } else if (typeof value === 'string') {
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
export default new FileParserService(); 