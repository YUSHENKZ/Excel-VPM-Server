/**
 * 文件监控服务，用于监控文件变化
 */
declare class FileWatcherService {
    private watchers;
    private eventListeners;
    private config;
    constructor();
    /**
     * 初始化服务
     */
    private init;
    /**
     * 启动文件监控
     */
    private startWatchers;
    /**
     * 停止文件监控
     */
    private stopWatchers;
    /**
     * 重启文件监控
     */
    private restartWatchers;
    /**
     * 检查文件类型是否被监控
     * @param filePath 文件路径
     * @param fileTypes 监控的文件类型
     * @returns 是否被监控
     */
    private isWatchedFileType;
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
declare const _default: FileWatcherService;
export default _default;
