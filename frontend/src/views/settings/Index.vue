<template>
  <DefaultLayout>
    <div class="settings-page">
      <div class="page-header card">
        <h2 class="page-title">系统设置</h2>
        <p class="page-description">自定义系统配置，调整应用功能和界面偏好</p>
      </div>
      
      <el-form
        v-if="!configStore.loading && configStore.config"
        :model="formData"
        ref="formRef"
        label-position="top"
        class="settings-form"
      >
        <!-- 界面设置 -->
        <div class="settings-section card">
          <h3 class="settings-section-title">界面设置</h3>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="主题">
                <el-select v-model="formData.ui.theme" placeholder="选择主题" class="full-width">
                  <el-option label="浅色" value="light" />
                  <el-option label="深色" value="dark" />
                  <el-option label="跟随系统" value="auto" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="语言">
                <el-select v-model="formData.ui.language" placeholder="选择语言" class="full-width">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="每页显示数据条数">
                <el-input-number
                  v-model="formData.ui.tableSettings.pageSize"
                  :min="10"
                  :max="200"
                  :step="10"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="开启表格搜索">
                <el-switch v-model="formData.ui.tableSettings.enableSearch" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 可视化设置 -->
        <div class="settings-section card">
          <h3 class="settings-section-title">可视化设置</h3>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="默认图表类型">
                <el-select v-model="formData.visualization.defaultChartType" placeholder="选择图表类型" class="full-width">
                  <el-option label="柱状图" value="bar" />
                  <el-option label="折线图" value="line" />
                  <el-option label="饼图" value="pie" />
                  <el-option label="散点图" value="scatter" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="颜色方案">
                <el-select v-model="formData.visualization.colorScheme" placeholder="选择颜色方案" class="full-width">
                  <el-option label="默认" value="default" />
                  <el-option label="明亮" value="light" />
                  <el-option label="暗色" value="dark" />
                  <el-option label="复古" value="vintage" />
                  <el-option label="马卡龙" value="macarons" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="启用动画">
                <el-switch v-model="formData.visualization.enableAnimation" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="自动刷新">
                <el-switch v-model="formData.visualization.autoRefresh" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="刷新间隔 (毫秒)" v-if="formData.visualization.autoRefresh">
                <el-input-number
                  v-model="formData.visualization.refreshInterval"
                  :min="5000"
                  :max="60000"
                  :step="1000"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 文件监控设置 -->
        <div class="settings-section card">
          <h3 class="settings-section-title">文件监控设置</h3>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="启用文件监控">
                <el-switch v-model="formData.fileWatching.enabled" />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="监控间隔 (毫秒)" v-if="formData.fileWatching.enabled">
                <el-input-number
                  v-model="formData.fileWatching.watchInterval"
                  :min="1000"
                  :max="30000"
                  :step="1000"
                  class="full-width"
                />
              </el-form-item>
            </el-col>
            
            <el-col :xs="24">
              <el-form-item label="监控目录">
                <el-tag
                  v-for="(dir, index) in formData.fileWatching.directories"
                  :key="index"
                  class="directory-tag"
                  closable
                  @close="removeDirectory(index)"
                >
                  {{ dir }}
                </el-tag>
                
                <el-input
                  v-if="directoryInputVisible"
                  ref="saveDirectoryInput"
                  v-model="directoryInputValue"
                  class="input-new-directory"
                  @keyup.enter="addDirectory"
                  @blur="addDirectory"
                />
                
                <el-button v-else class="button-new-directory" @click="showDirectoryInput">
                  + 添加目录
                </el-button>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24">
              <el-form-item label="监控文件类型">
                <el-tag
                  v-for="(type, index) in formData.fileWatching.fileTypes"
                  :key="index"
                  class="filetype-tag"
                  closable
                  @close="removeFileType(index)"
                >
                  {{ type }}
                </el-tag>
                
                <el-input
                  v-if="fileTypeInputVisible"
                  ref="saveFileTypeInput"
                  v-model="fileTypeInputValue"
                  class="input-new-filetype"
                  @keyup.enter="addFileType"
                  @blur="addFileType"
                />
                
                <el-button v-else class="button-new-filetype" @click="showFileTypeInput">
                  + 添加文件类型
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 文件编码设置 -->
        <div class="settings-section card">
          <h3 class="settings-section-title">文件设置</h3>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="文件编码">
                <el-select v-model="formData.fileEncoding" placeholder="选择文件编码" class="full-width">
                  <el-option label="UTF-8" value="utf8" />
                  <el-option label="UTF-16" value="utf16" />
                  <el-option label="GBK" value="gbk" />
                  <el-option label="GB18030" value="gb18030" />
                </el-select>
              </el-form-item>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8">
              <el-form-item label="CSV分隔符">
                <el-select v-model="formData.csvSeparator" placeholder="选择CSV分隔符" class="full-width">
                  <el-option label="逗号 ," value="," />
                  <el-option label="分号 ;" value=";" />
                  <el-option label="制表符 \t" value="\t" />
                  <el-option label="竖线 |" value="|" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        
        <!-- 操作按钮 -->
        <div class="form-actions card">
          <el-button @click="resetForm">重置</el-button>
          <el-button type="primary" @click="saveSettings" :loading="saving">保存设置</el-button>
        </div>
      </el-form>
      
      <!-- 加载状态 -->
      <div v-else-if="configStore.loading" class="loading-container card">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 错误状态 -->
      <el-alert
        v-else-if="configStore.error"
        :title="configStore.error"
        type="error"
        :closable="false"
        show-icon
        class="error-alert card"
      />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useConfigStore } from '@/stores/configStore';
import type { SystemConfig } from '@/types';

// 配置存储
const configStore = useConfigStore();

// 表单引用
const formRef = ref();

// 加载和保存状态
const saving = ref(false);

// 目录和文件类型输入
const directoryInputVisible = ref(false);
const fileTypeInputVisible = ref(false);
const directoryInputValue = ref('');
const fileTypeInputValue = ref('');
const saveDirectoryInput = ref();
const saveFileTypeInput = ref();

// 表单数据
const formData = reactive<SystemConfig>({
  fileWatching: {
    directories: [],
    fileTypes: [],
    watchInterval: 5000,
    enabled: true
  },
  visualization: {
    defaultChartType: 'bar',
    colorScheme: 'default',
    autoRefresh: false,
    refreshInterval: 30000,
    theme: 'default',
    enableAnimation: true
  },
  ui: {
    theme: 'light',
    language: 'zh-CN',
    tableSettings: {
      pageSize: 50,
      enableSearch: true
    }
  },
  fileEncoding: 'utf8',
  csvSeparator: ','
});

// 初始化
onMounted(async () => {
  await loadSettings();
});

// 加载设置
const loadSettings = async () => {
  try {
    await configStore.fetchConfig();
    
    if (configStore.config) {
      // 深拷贝配置到表单数据
      Object.assign(formData, JSON.parse(JSON.stringify(configStore.config)));
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
};

// 保存设置
const saveSettings = async () => {
  saving.value = true;
  
  try {
    const success = await configStore.updateConfig(formData);
    
    if (success) {
      ElMessage.success('设置保存成功');
    } else {
      ElMessage.error('设置保存失败');
    }
  } catch (error) {
    console.error('保存设置失败:', error);
    ElMessage.error('保存设置时发生错误');
  } finally {
    saving.value = false;
  }
};

// 重置表单
const resetForm = async () => {
  await loadSettings();
  ElMessage.info('设置已重置');
};

// 显示目录输入框
const showDirectoryInput = () => {
  directoryInputVisible.value = true;
  nextTick(() => {
    saveDirectoryInput.value.focus();
  });
};

// 显示文件类型输入框
const showFileTypeInput = () => {
  fileTypeInputVisible.value = true;
  nextTick(() => {
    saveFileTypeInput.value.focus();
  });
};

// 添加目录
const addDirectory = () => {
  if (directoryInputValue.value) {
    formData.fileWatching.directories.push(directoryInputValue.value);
  }
  directoryInputVisible.value = false;
  directoryInputValue.value = '';
};

// 添加文件类型
const addFileType = () => {
  if (fileTypeInputValue.value) {
    // 自动添加点号前缀
    const fileType = fileTypeInputValue.value.startsWith('.') 
      ? fileTypeInputValue.value 
      : '.' + fileTypeInputValue.value;
    
    formData.fileWatching.fileTypes.push(fileType);
  }
  fileTypeInputVisible.value = false;
  fileTypeInputValue.value = '';
};

// 移除目录
const removeDirectory = (index: number) => {
  formData.fileWatching.directories.splice(index, 1);
};

// 移除文件类型
const removeFileType = (index: number) => {
  formData.fileWatching.fileTypes.splice(index, 1);
};
</script>

<style scoped>
.settings-page {
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

.page-title {
  font-size: 24px;
  margin: 0 0 12px 0;
  font-weight: 500;
}

.page-description {
  color: #606266;
  margin: 0;
}

.settings-section-title {
  font-size: 18px;
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.full-width {
  width: 100%;
}

.loading-container {
  padding: 40px;
}

.error-alert {
  margin-bottom: 20px;
}

/* 标签样式 */
.directory-tag,
.filetype-tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.input-new-directory,
.input-new-filetype {
  width: 200px;
  margin-right: 10px;
  vertical-align: middle;
}

.button-new-directory,
.button-new-filetype {
  margin-bottom: 10px;
}

/* 深色模式 */
html.dark .card {
  background-color: #1f2937 !important;
  color: #e5e7eb !important;
  border-color: #374151 !important;
}

html.dark .page-description {
  color: #d1d5db;
}

html.dark .settings-section-title {
  border-bottom-color: #374151;
}

html.dark .el-form-item__label {
  color: #e5e7eb !important;
}

html.dark .el-input__inner,
html.dark .el-select__wrapper,
html.dark .el-input-number__decrease,
html.dark .el-input-number__increase {
  background-color: #374151 !important;
  color: #e5e7eb !important;
  border-color: #4b5563 !important;
}

html.dark .el-input.is-disabled .el-input__inner {
  background-color: #283548 !important;
}

html.dark .el-select-dropdown__item {
  color: #e5e7eb;
}

html.dark .el-select-dropdown__item.hover, 
html.dark .el-select-dropdown__item:hover {
  background-color: #374151;
}

html.dark .el-tag {
  background-color: #374151;
  border-color: #4b5563;
  color: #e5e7eb;
}

html.dark .el-button--default {
  background-color: #1f2937;
  border-color: #4b5563;
  color: #e5e7eb;
}

html.dark .el-button--default:hover {
  background-color: #374151;
}

html.dark .el-empty__description {
  color: #9ca3af;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .form-actions {
    flex-direction: column-reverse;
  }
  
  .form-actions .el-button {
    width: 100%;
  }
}
</style> 