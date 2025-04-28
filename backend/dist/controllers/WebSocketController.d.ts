import http from 'http';
/**
 * WebSocket控制器，处理WebSocket连接和事件
 */
declare class WebSocketController {
    private io;
    /**
     * 初始化WebSocket服务器
     * @param server HTTP服务器实例
     */
    init(server: http.Server): void;
    /**
     * 设置文件变化监听器
     */
    private setupFileChangeListener;
    /**
     * 设置配置变化监听器
     */
    private setupConfigChangeListener;
    /**
     * 设置可视化配置变化监听器
     */
    private setupVisualizationChangeListener;
}
declare const _default: WebSocketController;
export default _default;
