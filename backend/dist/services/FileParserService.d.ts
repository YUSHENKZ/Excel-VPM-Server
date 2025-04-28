import { TableData } from '../models';
/**
 * 文件解析服务，用于解析不同格式的表格文件
 */
declare class FileParserService {
    /**
     * 解析文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    parseFile(filePath: string): Promise<TableData>;
    /**
     * 解析CSV文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    private parseCSV;
    /**
     * 解析Excel文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    private parseExcel;
    /**
     * 解析JSON文件
     * @param filePath 文件路径
     * @returns 表格数据
     */
    private parseJSON;
    /**
     * 根据数据生成表头
     * @param row 第一行数据
     * @returns 表头数组
     */
    private generateHeaders;
}
declare const _default: FileParserService;
export default _default;
