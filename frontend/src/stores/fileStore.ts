import { defineStore } from 'pinia';
import apiService from '@/services/api';
import type { FileInfo, TableData } from '@/types';

export const useFileStore = defineStore('file', {
  state: () => ({
    files: [] as FileInfo[],
    currentFile: null as FileInfo | null,
    currentPath: '',
    tableData: null as TableData | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    // 获取当前目录下的文件
    currentDirectoryFiles: (state) => {
      return state.files.filter(file => !file.isDirectory);
    },
    // 获取当前目录下的文件夹
    currentDirectoryFolders: (state) => {
      return state.files.filter(file => file.isDirectory);
    },
    // 获取文件的父路径
    parentPath: (state) => {
      if (!state.currentPath || state.currentPath === '/') return '';
      const pathParts = state.currentPath.split('/').filter(Boolean);
      pathParts.pop();
      return pathParts.length ? `/${pathParts.join('/')}` : '/';
    },
  },

  actions: {
    // 获取文件列表
    async fetchFiles(path?: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.getFiles(path);
        if (response.code === 200) {
          this.files = response.data;
          if (path !== undefined) {
            this.currentPath = path;
          }
        } else {
          this.error = response.message;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取文件列表失败';
        console.error('获取文件列表错误:', err);
      } finally {
        this.loading = false;
      }
    },

    // 获取文件内容
    async fetchFileContent(fileId: string) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.getFileContent(fileId);
        if (response.code === 200) {
          this.tableData = response.data;
          this.currentFile = this.files.find(file => file.id === fileId) || null;
        } else {
          this.error = response.message;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '获取文件内容失败';
        console.error('获取文件内容错误:', err);
      } finally {
        this.loading = false;
      }
    },

    // 上传文件
    async uploadFile(file: File) {
      this.loading = true;
      this.error = null;
      try {
        const response = await apiService.uploadFile(file);
        if (response.code === 201) {
          // 添加新文件到列表
          this.files.push(response.data);
          return response.data;
        } else {
          this.error = response.message;
          return null;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '上传文件失败';
        console.error('上传文件错误:', err);
        return null;
      } finally {
        this.loading = false;
      }
    },

    // 设置当前文件
    setCurrentFile(file: FileInfo | null) {
      this.currentFile = file;
      if (file && !file.isDirectory) {
        this.fetchFileContent(file.id);
      } else {
        this.tableData = null;
      }
    },

    // 导航到目录
    navigateToDirectory(path: string) {
      this.fetchFiles(path);
    },

    // 导航到父目录
    navigateToParent() {
      if (this.parentPath !== '') {
        this.navigateToDirectory(this.parentPath);
      }
    },

    // 处理文件变化事件
    handleFileChange() {
      // 刷新当前目录的文件列表
      this.fetchFiles(this.currentPath);
      // 如果当前正在查看的文件发生变化，也刷新其内容
      if (this.currentFile) {
        this.fetchFileContent(this.currentFile.id);
      }
    },

    // 重置状态
    reset() {
      this.files = [];
      this.currentFile = null;
      this.currentPath = '';
      this.tableData = null;
      this.loading = false;
      this.error = null;
    },
  },
}); 