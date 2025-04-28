import { SystemConfig } from '../models';
/**
 * 配置服务，负责读取和保存系统配置
 */
declare class ConfigService {
    private config;
    private eventListeners;
    constructor();
    /**
     * 初始化配置
     */
    private init;
    /**
     * 从配置文件加载配置
     */
    private loadConfig;
    /**
     * 获取系统配置
     * @returns 系统配置
     */
    getConfig(): Promise<SystemConfig>;
    /**
     * 更新系统配置
     * @param newConfig 新的配置
     * @returns 更新后的配置
     */
    updateConfig(newConfig: SystemConfig): Promise<SystemConfig>;
    /**
     * 保存配置到文件
     * @param config 要保存的配置
     */
    private saveConfig;
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
declare const _default: ConfigService;
export default _default;
