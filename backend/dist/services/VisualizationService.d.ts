import { VisualizationConfig } from '../models';
/**
 * 可视化配置服务，用于管理可视化配置
 */
declare class VisualizationService {
    private eventListeners;
    constructor();
    /**
     * 初始化服务
     */
    private init;
    /**
     * 获取文件的所有可视化配置
     * @param fileId 文件ID
     * @returns 可视化配置数组
     */
    getVisualizations(fileId: string): Promise<VisualizationConfig[]>;
    /**
     * 创建新的可视化配置
     * @param fileId 文件ID
     * @param config 可视化配置
     * @returns 创建的可视化配置
     */
    createVisualization(fileId: string, config: VisualizationConfig): Promise<VisualizationConfig>;
    /**
     * 更新可视化配置
     * @param fileId 文件ID
     * @param visId 可视化配置ID
     * @param config 更新的配置
     * @returns 更新后的配置
     */
    updateVisualization(fileId: string, visId: string, config: VisualizationConfig): Promise<VisualizationConfig>;
    /**
     * 删除可视化配置
     * @param fileId 文件ID
     * @param visId 可视化配置ID
     */
    deleteVisualization(fileId: string, visId: string): Promise<void>;
    /**
     * 保存可视化配置
     * @param fileId 文件ID
     * @param visualizations 可视化配置数组
     */
    private saveVisualizations;
    /**
     * 获取可视化配置文件路径
     * @param fileId 文件ID
     * @returns 文件路径
     */
    private getVisualizationFilePath;
    /**
     * 注册事件监听器
     * @param event 事件名称
     * @param callback 回调函数
     */
    on(event: string, callback: (data: any) => void): void;
    /**
     * 触发事件
     * @param event 事件名称
     * @param data 事件数据
     */
    private emit;
}
declare const _default: VisualizationService;
export default _default;
