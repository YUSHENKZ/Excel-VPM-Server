// API 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 文件信息
export interface FileInfo {
  id: string; // Base64编码的文件路径
  name: string;
  path: string;
  type: string;
  size: number;
  lastModified: string;
  isDirectory: boolean;
}

// 表格列头
export interface TableHeader {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
}

// 表格元数据
export interface TableMetadata {
  fileName: string;
  fileType: string;
  lastModified: string;
  rowCount: number;
  filePath?: string;
  fileSize?: number;
}

// 表格数据
export interface TableData {
  headers: TableHeader[];
  rows: Record<string, any>[];
  metadata: TableMetadata;
}

// 可视化配置
export interface VisualizationConfig {
  id?: string;
  name: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'custom';
  dataMapping: {
    x?: string;
    y?: string | string[];
    series?: string;
    size?: string;
    color?: string;
  };
  options: Record<string, any>; // 特定图表类型的配置选项
}

// 系统配置
export interface SystemConfig {
  fileWatching: {
    directories: string[];
    fileTypes: string[];
    watchInterval: number;
    enabled: boolean;
  };
  visualization: {
    defaultChartType: string;
    colorScheme: string;
    autoRefresh: boolean;
    refreshInterval: number;
    theme: string;
    enableAnimation: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    tableSettings: {
      pageSize: number;
      enableSearch: boolean;
    };
  };
  fileEncoding: string;
  csvSeparator: string;
}

// WebSocket事件类型
export interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  timestamp: string;
}

export interface ConfigChangeEvent {
  timestamp: string;
  config: SystemConfig;
}

export interface VisualizationChangeEvent {
  type: 'create' | 'update' | 'delete';
  fileId: string;
  visualizationId?: string;
  timestamp: string;
  config?: VisualizationConfig;
} 