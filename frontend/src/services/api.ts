import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse, FileInfo, TableData, VisualizationConfig, SystemConfig } from '@/types';

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 可以在这里添加认证令牌等
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一处理错误
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// API服务类
class ApiService {
  // 健康检查
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get<{ status: string; timestamp: string }>('/health');
    return response.data;
  }

  // 获取文件列表
  async getFiles(path?: string, includeSubdirectories = true): Promise<ApiResponse<FileInfo[]>> {
    const params: Record<string, any> = {};
    if (path) params.path = path;
    params.includeSubdirectories = includeSubdirectories;

    const response = await api.get<ApiResponse<FileInfo[]>>('/files', { params });
    return response.data;
  }

  // 获取文件内容
  async getFileContent(id: string): Promise<ApiResponse<TableData>> {
    const response = await api.get<ApiResponse<TableData>>(`/files/${id}/content`);
    return response.data;
  }

  // 上传文件
  async uploadFile(file: File): Promise<ApiResponse<FileInfo>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<FileInfo>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // 获取可视化配置
  async getVisualizations(fileId: string): Promise<ApiResponse<VisualizationConfig[]>> {
    const response = await api.get<ApiResponse<VisualizationConfig[]>>(`/files/${fileId}/visualizations`);
    return response.data;
  }

  // 创建可视化配置
  async createVisualization(fileId: string, config: Omit<VisualizationConfig, 'id'>): Promise<ApiResponse<VisualizationConfig>> {
    const response = await api.post<ApiResponse<VisualizationConfig>>(`/files/${fileId}/visualizations`, config);
    return response.data;
  }

  // 更新可视化配置
  async updateVisualization(fileId: string, visId: string, config: Omit<VisualizationConfig, 'id'>): Promise<ApiResponse<VisualizationConfig>> {
    const response = await api.put<ApiResponse<VisualizationConfig>>(`/files/${fileId}/visualizations/${visId}`, config);
    return response.data;
  }

  // 删除可视化配置
  async deleteVisualization(fileId: string, visId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/files/${fileId}/visualizations/${visId}`);
    return response.data;
  }

  // 获取系统配置
  async getSystemConfig(): Promise<ApiResponse<SystemConfig>> {
    const response = await api.get<ApiResponse<SystemConfig>>('/config');
    return response.data;
  }

  // 更新系统配置
  async updateSystemConfig(config: SystemConfig): Promise<ApiResponse<SystemConfig>> {
    const response = await api.put<ApiResponse<SystemConfig>>('/config', config);
    return response.data;
  }
}

export default new ApiService(); 