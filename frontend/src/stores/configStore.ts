import { defineStore } from 'pinia';
import apiService from '@/services/api';
import type { SystemConfig } from '@/types';

export const useConfigStore = defineStore('config', {
  state: () => ({
    config: null as SystemConfig | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // 获取UI主题
    theme: (state) => state.config?.ui.theme || 'light',
    // 获取语言设置
    language: (state) => state.config?.ui.language || 'zh-CN',
    // 获取表格分页大小
    pageSize: (state) => state.config?.ui.tableSettings.pageSize || 50,
    // 检查是否启用搜索功能
    searchEnabled: (state) => state.config?.ui.tableSettings.enableSearch || true,
    // 获取默认图表类型
    defaultChartType: (state) => state.config?.visualization.defaultChartType || 'bar',
    // 获取颜色方案
    colorScheme: (state) => state.config?.visualization.colorScheme || 'default',
    // 检查是否自动刷新
    autoRefresh: (state) => state.config?.visualization.autoRefresh || false,
    // 获取刷新间隔
    refreshInterval: (state) => state.config?.visualization.refreshInterval || 30000,
    // 获取文件监控设置
    fileWatchSettings: (state) => state.config?.fileWatching || { 
      directories: ['./data', './uploads'], 
      fileTypes: ['.csv', '.xlsx', '.json'], 
      watchInterval: 5000,
      enabled: true
    },
  },

  actions: {
    // 获取系统配置
    async fetchConfig() {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.getSystemConfig();
        if (response.code === 200) {
          this.config = response.data;
        } else {
          this.error = response.message;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取系统配置失败';
        console.error('获取系统配置错误:', err);
      } finally {
        this.loading = false;
      }
    },

    // 更新系统配置
    async updateConfig(config: SystemConfig) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.updateSystemConfig(config);
        if (response.code === 200) {
          this.config = response.data;
          return true;
        } else {
          this.error = response.message;
          return false;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '更新系统配置失败';
        console.error('更新系统配置错误:', err);
        return false;
      } finally {
        this.loading = false;
      }
    },

    // 设置UI主题
    async setTheme(theme: 'light' | 'dark' | 'auto') {
      try {
        if (!this.config) await this.fetchConfig();
        if (!this.config) {
          console.error('无法设置主题: 配置未加载');
          return false;
        }

        const updatedConfig = { ...this.config };
        updatedConfig.ui.theme = theme;
        
        // 立即更新系统主题（DOM更新）
        document.documentElement.classList.remove('light', 'dark');
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          console.log('应用深色主题到DOM');
          document.documentElement.classList.add('dark');
        } else {
          console.log('应用浅色主题到DOM');
          document.documentElement.classList.add('light');
        }

        // 更新本地状态
        this.config.ui.theme = theme;
        
        // 然后尝试通过API保存设置
        console.log('通过API保存主题设置:', theme);
        const success = await this.updateConfig(updatedConfig);
        
        if (!success) {
          console.warn('主题已在本地更改，但未能保存到服务器');
        }
        
        return true; // DOM更新成功就返回true
      } catch (error) {
        console.error('设置主题时出错:', error);
        return false;
      }
    },

    // 设置语言
    async setLanguage(language: string) {
      if (!this.config) await this.fetchConfig();
      if (!this.config) return false;

      const updatedConfig = { ...this.config };
      updatedConfig.ui.language = language;
      return this.updateConfig(updatedConfig);
    },

    // 设置表格分页大小
    async setPageSize(pageSize: number) {
      if (!this.config) await this.fetchConfig();
      if (!this.config) return false;

      const updatedConfig = { ...this.config };
      updatedConfig.ui.tableSettings.pageSize = pageSize;
      return this.updateConfig(updatedConfig);
    },

    // 处理配置变化事件
    handleConfigChange(newConfig: SystemConfig) {
      console.log('处理配置变化事件:', newConfig);
      
      // 备份旧主题用于比较
      const oldTheme = this.config?.ui.theme;
      
      // 更新配置对象
      this.config = newConfig;
      
      // 检查主题是否变化
      if (oldTheme !== newConfig.ui.theme) {
        console.log(`主题从 ${oldTheme} 变更为 ${newConfig.ui.theme}`);
        
        // 更新UI主题
        const theme = newConfig.ui.theme;
        document.documentElement.classList.remove('light', 'dark');
        if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          console.log('通过配置变更应用深色主题');
          document.documentElement.classList.add('dark');
        } else {
          console.log('通过配置变更应用浅色主题');
          document.documentElement.classList.add('light');
        }
      }
    },

    // 重置状态
    reset() {
      this.config = null;
      this.loading = false;
      this.error = null;
    },
  },
}); 