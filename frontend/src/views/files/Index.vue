<template>
  <DefaultLayout>
    <div class="files-page">
      <!-- 工具栏 -->
      <div class="toolbar card">
        <div class="breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/files' }">
              <el-icon><icon-home /></el-icon> 根目录
            </el-breadcrumb-item>
            <template v-for="(path, index) in breadcrumbPaths" :key="index">
              <el-breadcrumb-item :to="{ path: `/files?path=${path.url}` }">
                {{ path.name }}
              </el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </div>
        
        <div class="toolbar-actions">
          <el-upload
            :action="null"
            :http-request="uploadFile"
            :show-file-list="false"
            :multiple="false"
            :before-upload="beforeUpload"
          >
            <el-button type="primary">
              <el-icon><icon-upload /></el-icon>
              上传文件
            </el-button>
          </el-upload>
          
          <el-button @click="refreshFiles">
            <el-icon><icon-refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      
      <!-- 桌面端文件列表（表格视图） -->
      <div class="files-container card desktop-view">
        <el-table
          v-loading="fileStore.loading"
          :data="filteredFiles"
          style="width: 100%"
          @row-click="handleRowClick"
        >
          <el-table-column label="名称" min-width="240">
            <template #default="{ row }">
              <div class="file-item">
                <el-icon v-if="row.isDirectory" class="file-icon">
                  <icon-folder />
                </el-icon>
                <el-icon v-else class="file-icon">
                  <icon-document />
                </el-icon>
                <span class="file-name">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="type" label="类型" width="120" />
          
          <el-table-column label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          
          <el-table-column label="修改时间" min-width="180">
            <template #default="{ row }">
              {{ formatDate(row.lastModified) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <div v-if="!row.isDirectory">
                <el-button-group>
                  <el-button size="small" @click.stop="viewTable(row)">
                    <el-icon><icon-view /></el-icon>
                    查看
                  </el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click.stop="visualizeData(row)"
                  >
                    <el-icon><icon-data-analysis /></el-icon>
                    可视化
                  </el-button>
                </el-button-group>
              </div>
              <el-button v-else size="small" @click.stop="openDirectory(row)">
                <el-icon><icon-folder-opened /></el-icon>
                打开
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 - 桌面版 -->
        <el-empty v-if="!fileStore.loading && filteredFiles.length === 0" description="当前目录为空">
          <el-button type="primary" @click="goParentDirectory" v-if="fileStore.currentPath !== ''">
            返回上级目录
          </el-button>
        </el-empty>
      </div>
      
      <!-- 移动端文件列表（卡片视图） -->
      <div class="files-container card mobile-view">
        <div v-loading="fileStore.loading" class="file-cards">
          <!-- 空状态 - 移动版 -->
          <el-empty 
            v-if="!fileStore.loading && filteredFiles.length === 0" 
            description="当前目录为空" 
            class="mobile-empty"
          >
            <el-button type="primary" @click="goParentDirectory" v-if="fileStore.currentPath !== ''">
              返回上级目录
            </el-button>
          </el-empty>
          
          <!-- 文件卡片列表 -->
          <div 
            v-for="file in filteredFiles" 
            :key="file.id" 
            class="file-card"
            @click="handleRowClick(file)"
          >
            <div class="file-card-header">
              <div class="file-item">
                <el-icon v-if="file.isDirectory" class="file-icon">
                  <icon-folder />
                </el-icon>
                <el-icon v-else class="file-icon">
                  <icon-document />
                </el-icon>
                <span class="file-name">{{ file.name }}</span>
              </div>
            </div>
            
            <div class="file-card-info">
              <div class="info-item">
                <span class="info-label">类型:</span>
                <span class="info-value">{{ file.type }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">大小:</span>
                <span class="info-value">{{ formatFileSize(file.size) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">修改时间:</span>
                <span class="info-value">{{ formatDate(file.lastModified) }}</span>
              </div>
            </div>
            
            <div class="file-card-actions">
              <div v-if="!file.isDirectory">
                <el-button size="small" @click.stop="viewTable(file)">
                  <el-icon><icon-view /></el-icon>
                  查看
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click.stop="visualizeData(file)"
                >
                  <el-icon><icon-data-analysis /></el-icon>
                  可视化
                </el-button>
              </div>
              <el-button v-else size="small" @click.stop="openDirectory(file)">
                <el-icon><icon-folder-opened /></el-icon>
                打开
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useFileStore } from '@/stores/fileStore';
import { useConfigStore } from '@/stores/configStore';
import websocketService from '@/services/websocket';
import type { FileInfo } from '@/types';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  IconFolder, 
  IconDocument, 
  IconHome, 
  IconUpload, 
  IconRefresh, 
  IconView, 
  IconDataAnalysis,
  IconFolderOpened 
} from '@/components/icons';

// 路由相关
const router = useRouter();
const route = useRoute();

// 存储
const fileStore = useFileStore();
const configStore = useConfigStore();

// 被隐藏的系统目录
const hiddenSystemDirs = ['datasets', 'models', 'config', 'logs', 'temp', 'data', 'visualizations']; 

// 过滤后的文件列表
const filteredFiles = computed(() => {
  // 过滤掉系统目录
  const folders = fileStore.currentDirectoryFolders.filter(folder => 
    !hiddenSystemDirs.includes(folder.name)
  );
  
  // 返回过滤后的文件夹和所有文件
  return [...folders, ...fileStore.currentDirectoryFiles];
});

// 面包屑路径
const breadcrumbPaths = computed(() => {
  if (!fileStore.currentPath) return [];
  
  const paths = fileStore.currentPath.split('/').filter(Boolean);
  
  return paths.map((path, index) => {
    // 构建到当前部分的路径
    const url = '/' + paths.slice(0, index + 1).join('/');
    return { name: path, url };
  });
});

// 初始化
onMounted(async () => {
  // 从URL获取路径
  const pathFromQuery = route.query.path as string | undefined;
  await loadFiles(pathFromQuery || '');
  
  // 监听WebSocket事件
  websocketService.onFileChange(() => {
    refreshFiles();
  });
});

// 监听路由参数变化
watch(
  () => route.query.path,
  (newPath) => {
    if (typeof newPath === 'string') {
      loadFiles(newPath);
    } else {
      loadFiles('');
    }
  }
);

// 加载文件
const loadFiles = async (path: string) => {
  try {
    await fileStore.fetchFiles(path);
  } catch (error) {
    ElMessage.error('加载文件失败');
    console.error('加载文件失败:', error);
  }
};

// 刷新文件列表
const refreshFiles = () => {
  loadFiles(fileStore.currentPath);
};

// 打开目录
const openDirectory = (directory: FileInfo) => {
  const path = directory.path;
  router.push({ path: '/files', query: { path } });
};

// 返回上级目录
const goParentDirectory = () => {
  if (fileStore.parentPath !== '') {
    router.push({ path: '/files', query: { path: fileStore.parentPath } });
  }
};

// 查看表格
const viewTable = (file: FileInfo) => {
  router.push(`/table/${file.id}`);
};

// 可视化数据
const visualizeData = (file: FileInfo) => {
  router.push(`/visualization/${file.id}`);
};

// 处理行点击
const handleRowClick = (row: FileInfo) => {
  if (row.isDirectory) {
    openDirectory(row);
  } else {
    viewTable(row);
  }
};

// 上传前检查
const beforeUpload = (file: File) => {
  // 检查文件类型
  const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedTypes = configStore.config?.fileWatching.fileTypes || ['.csv', '.xlsx', '.json'];
  
  // 移除前面的"."以便比较
  const normalizedAllowedTypes = allowedTypes.map(type => 
    type.startsWith('.') ? type.substring(1) : type
  );
  
  if (!normalizedAllowedTypes.includes(fileExt)) {
    ElMessage.error(`不支持的文件类型: ${fileExt}，允许的类型: ${allowedTypes.join(', ')}`);
    return false;
  }
  
  return true;
};

// 上传文件
const uploadFile = async (options: any) => {
  try {
    const file = options.file;
    const result = await fileStore.uploadFile(file);
    
    if (result) {
      ElMessage.success('文件上传成功');
      refreshFiles();
    } else {
      ElMessage.error('文件上传失败');
    }
  } catch (error) {
    ElMessage.error('文件上传失败');
    console.error('文件上传错误:', error);
  }
};

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(size) / Math.log(1024));
  
  return `${(size / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
</script>

<style scoped>
.files-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.file-name {
  font-weight: 500;
}

/* 默认显示桌面视图，隐藏移动视图 */
.mobile-view {
  display: none;
}

.desktop-view {
  display: block;
}

/* 文件卡片样式 */
.file-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.file-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-card-header {
  margin-bottom: 12px;
}

.file-card-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-label {
  color: #909399;
  min-width: 80px;
}

.info-value {
  color: #606266;
}

.file-card-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.mobile-empty {
  margin: 20px 0;
}

/* 深色模式 */
html.dark .card {
  background-color: #1f2937;
  color: #e5e7eb;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

html.dark .file-card {
  border-color: #374151;
  background-color: #1f2937;
}

html.dark .info-label {
  color: #9ca3af;
}

html.dark .info-value {
  color: #d1d5db;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 16px;
  }
  
  .toolbar > * {
    width: 100%;
  }
  
  /* 显示移动视图，隐藏桌面视图 */
  .mobile-view {
    display: block;
  }
  
  .desktop-view {
    display: none;
  }
  
  .toolbar-actions {
    justify-content: space-between;
  }
  
  .toolbar-actions > * {
    flex: 1;
  }
}
</style> 