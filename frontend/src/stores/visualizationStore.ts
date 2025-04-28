import { defineStore } from 'pinia';
import apiService from '@/services/api';
import type { VisualizationConfig } from '@/types';

export const useVisualizationStore = defineStore('visualization', {
  state: () => ({
    visualizations: [] as VisualizationConfig[],
    currentVisualization: null as VisualizationConfig | null,
    currentFileId: '',
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // 获取指定文件的可视化配置
    async fetchVisualizations(fileId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.getVisualizations(fileId);
        if (response.code === 200) {
          this.visualizations = response.data;
          this.currentFileId = fileId;
        } else {
          this.error = response.message;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取可视化配置失败';
        console.error('获取可视化配置错误:', err);
      } finally {
        this.loading = false;
      }
    },

    // 创建可视化配置
    async createVisualization(fileId: string, config: Omit<VisualizationConfig, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.createVisualization(fileId, config);
        if (response.code === 201) {
          // 添加新配置到列表
          this.visualizations.push(response.data);
          return response.data;
        } else {
          this.error = response.message;
          return null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '创建可视化配置失败';
        console.error('创建可视化配置错误:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 更新可视化配置
    async updateVisualization(fileId: string, visId: string, config: Omit<VisualizationConfig, 'id'>) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.updateVisualization(fileId, visId, config);
        if (response.code === 200) {
          // 更新配置列表
          const index = this.visualizations.findIndex(vis => vis.id === visId);
          if (index !== -1) {
            this.visualizations[index] = response.data;
          }
          return response.data;
        } else {
          this.error = response.message;
          return null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新可视化配置失败';
        console.error('更新可视化配置错误:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 删除可视化配置
    async deleteVisualization(fileId: string, visId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.deleteVisualization(fileId, visId);
        if (response.code === 200) {
          // 从列表中移除配置
          this.visualizations = this.visualizations.filter(vis => vis.id !== visId);
          // 如果当前选中的是被删除的配置，则清除选择
          if (this.currentVisualization?.id === visId) {
            this.currentVisualization = null;
          }
          return true;
        } else {
          this.error = response.message;
          return false;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '删除可视化配置失败';
        console.error('删除可视化配置错误:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 设置当前选中的可视化配置
    setCurrentVisualization(visualization: VisualizationConfig | null) {
      this.currentVisualization = visualization;
    },

    // 创建默认可视化配置
    createDefaultVisualization(fileId: string, headers: { key: string; type: string }[]) {
      const numericColumns = headers.filter(header => header.type === 'number');
      const categoryColumns = headers.filter(header => header.type === 'string');
      
      // 如果没有合适的列，返回null
      if (!numericColumns.length || !categoryColumns.length) {
        return null;
      }

      const defaultConfig: Omit<VisualizationConfig, 'id'> = {
        name: '默认图表',
        type: 'bar',
        dataMapping: {
          x: categoryColumns[0].key,
          y: numericColumns[0].key,
        },
        options: {
          title: '默认数据可视化',
          xAxisLabel: categoryColumns[0].key,
          yAxisLabel: numericColumns[0].key,
        },
      };

      return this.createVisualization(fileId, defaultConfig);
    },

    // 处理可视化配置变化事件
    handleVisualizationChange(fileId: string) {
      if (this.currentFileId === fileId) {
        this.fetchVisualizations(fileId);
      }
    },

    // 重置状态
    reset() {
      this.visualizations = [];
      this.currentVisualization = null;
      this.currentFileId = '';
      this.loading = false;
      this.error = null;
    },
  },
}); 