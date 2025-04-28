export interface TableData {
    headers: Array<TableHeader>;
    rows: Array<Record<string, any>>;
    metadata: TableMetadata;
}
export interface TableHeader {
    key: string;
    label: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    width?: number;
    sortable?: boolean;
    filterable?: boolean;
}
export interface TableMetadata {
    fileName: string;
    fileType: string;
    lastModified: Date;
    rowCount: number;
    filePath?: string;
    fileSize?: number;
}
export interface VisualizationConfig {
    id?: string;
    name: string;
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'custom';
    dataMapping: {
        x?: string;
        y?: string;
        series?: string;
        size?: string;
        color?: string;
    };
    options: Record<string, any>;
}
export interface SystemConfig {
    fileWatching: {
        directories: string[];
        fileTypes: string[];
        watchInterval: number;
    };
    visualization: {
        defaultChartType: string;
        colorScheme: string;
        autoRefresh: boolean;
        refreshInterval: number;
    };
    ui: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        tableSettings: {
            pageSize: number;
            enableSearch: boolean;
        };
    };
}
export interface FileInfo {
    id: string;
    name: string;
    path: string;
    type: string;
    size: number;
    lastModified: Date;
    isDirectory: boolean;
}
export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}
