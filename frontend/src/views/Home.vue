<template>
  <DefaultLayout>
    <div class="home-page">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="24" :md="24" :lg="18" :xl="18">
          <div class="welcome-section card">
            <h2 class="welcome-title">欢迎使用表格预览与数据可视化中间件</h2>
            <p class="welcome-description">
              这是一个功能强大的工具，用于预览和可视化表格数据。您可以轻松浏览文件、查看表格内容并创建炫酷的数据可视化图表。
            </p>
            
            <div class="action-buttons">
              <el-button type="primary" @click="navigateTo('/files')">
                <el-icon><icon-folder /></el-icon>
                浏览文件
              </el-button>
              <el-button @click="navigateTo('/settings')">
                <el-icon><icon-setting /></el-icon>
                系统设置
              </el-button>
            </div>
          </div>
          
          <div class="recent-files card" v-if="recentFiles.length > 0">
            <h3 class="section-title">最近访问的文件</h3>
            <el-table :data="recentFiles" style="width: 100%">
              <el-table-column prop="name" label="文件名" min-width="180">
                <template #default="{ row }">
                  <router-link :to="`/table/${row.id}`" class="file-link">
                    {{ row.name }}
                  </router-link>
                </template>
              </el-table-column>
              <el-table-column prop="type" label="类型" width="120" />
              <el-table-column prop="lastModified" label="上次修改" min-width="180">
                <template #default="{ row }">
                  {{ formatDate(row.lastModified) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button size="small" @click="navigateTo(`/table/${row.id}`)">查看</el-button>
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="navigateTo(`/visualization/${row.id}`)"
                    >
                      可视化
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-col>
        
        <el-col :xs="24" :sm="24" :md="24" :lg="6" :xl="6">
          <div class="system-info card">
            <h3 class="section-title">系统信息</h3>
            <el-descriptions direction="vertical" :column="1" border>
              <el-descriptions-item label="当前主题">
                {{ configStore.theme }}
              </el-descriptions-item>
              <el-descriptions-item label="文件监控">
                {{ configStore.config?.fileWatching.enabled ? '已启用' : '已禁用' }}
              </el-descriptions-item>
              <el-descriptions-item label="默认图表类型">
                {{ configStore.defaultChartType }}
              </el-descriptions-item>
              <el-descriptions-item label="表格设置">
                每页 {{ configStore.pageSize }} 条
              </el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div class="quick-tips card">
            <h3 class="section-title">快速提示</h3>
            <ul class="tips-list">
              <li>通过文件浏览页面上传新文件</li>
              <li>点击文件名查看表格内容</li>
              <li>在表格页面创建可视化图表</li>
              <li>调整系统设置自定义您的体验</li>
              <li>表格支持排序、筛选和搜索功能</li>
            </ul>
          </div>
        </el-col>
      </el-row>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useFileStore } from '@/stores/fileStore';
import { useConfigStore } from '@/stores/configStore';
import type { FileInfo } from '@/types';
import { IconFolder, IconSetting } from '@/components/icons';

// 路由器
const router = useRouter();

// 存储
const fileStore = useFileStore();
const configStore = useConfigStore();

// 最近文件
const recentFiles = ref<FileInfo[]>([]);

// 路由导航
const navigateTo = (path: string) => {
  router.push(path);
};

// 日期格式化
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取最近文件
const getRecentFiles = async () => {
  try {
    // 加载根目录文件
    await fileStore.fetchFiles();
    
    // 过滤出非目录的最近 5 个文件
    const files = fileStore.files
      .filter(file => !file.isDirectory)
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 5);
    
    recentFiles.value = files;
  } catch (error) {
    console.error('获取最近文件错误:', error);
  }
};

// 生命周期钩子
onMounted(async () => {
  if (!configStore.config) {
    await configStore.fetchConfig();
  }
  
  await getRecentFiles();
});
</script>

<style scoped>
.home-page {
  padding: 0;
}

.card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 20px;
  background-color: white;
}

.welcome-section {
  background: linear-gradient(to right, #1890FF, #3a76e1);
  color: white;
  padding: 30px;
}

.welcome-title {
  font-size: 24px;
  margin-bottom: 16px;
}

.welcome-description {
  font-size: 16px;
  margin-bottom: 24px;
  opacity: 0.9;
  line-height: 1.6;
}

.action-buttons {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  margin-bottom: 16px;
  font-weight: 500;
  color: #333;
}

.file-link {
  color: #1890FF;
  text-decoration: none;
  font-weight: 500;
}

.file-link:hover {
  text-decoration: underline;
}

.tips-list {
  padding-left: 20px;
  margin-top: 12px;
}

.tips-list li {
  margin-bottom: 10px;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-section {
    padding: 20px;
  }
  
  .welcome-title {
    font-size: 20px;
  }
  
  .welcome-description {
    font-size: 14px;
  }
}

/* 深色模式 */
html.dark .card {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.2) !important;
}

html.dark .system-info.card,
html.dark .quick-tips.card {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
}

html.dark .welcome-section {
  background: linear-gradient(to right, #1890FF, #1565c0);
}

html.dark .section-title {
  color: #f9fafb !important;
}

html.dark .file-link {
  color: #60a5fa;
}

html.dark .el-descriptions {
  --el-descriptions-item-bordered-label-background: #283548 !important;
  --el-descriptions-item-bordered-content-background: #1f2937 !important;
  --el-descriptions-item-bordered-label-text-color: #e5e7eb !important;
  --el-text-color-primary: #ffffff !important;
  --el-text-color-regular: #e5e7eb !important;
  --el-border-color: #4b5563 !important;
}

html.dark .el-descriptions__label {
  color: #ffffff !important;
  font-weight: 500 !important;
}

html.dark .el-descriptions__content {
  color: #e5e7eb !important;
}

html.dark .el-descriptions__body,
html.dark .el-descriptions__cell {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
  border-color: #4b5563 !important;
}

html.dark .el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: #283548 !important;
}

html.dark .tips-list li {
  color: #d1d5db;
}

/* 强制覆盖右侧卡片背景色 */
html.dark .home-page .el-row .el-col:last-child .card,
html.dark .system-info,
html.dark .quick-tips {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
  --el-bg-color: #1f2937 !important;
  --el-fill-color-blank: #1f2937 !important;
}

/* 增强系统信息面板标题可见性 */
html.dark .system-info .section-title,
html.dark .quick-tips .section-title {
  color: #ffffff !important; /* 使用纯白色增强标题可见性 */
  font-weight: 600 !important; /* 增加字体粗细 */
}

/* 增强系统信息内容文字可见性 */
html.dark .system-info .el-descriptions-item__content {
  color: #e5e7eb !important; /* 使用浅灰色保持良好对比度 */
  font-weight: 500 !important; /* 增加字体粗细 */
}

/* 强制覆盖最近访问的文件卡片 */
html.dark .recent-files.card {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
  --el-bg-color: #1f2937 !important;
  --el-fill-color-blank: #1f2937 !important;
}
</style> 