<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useConfigStore } from '@/stores/configStore';
import websocketService from '@/services/websocket';

const router = useRouter();
const configStore = useConfigStore();

// 检查是否是暗色模式
const isDarkMode = computed(() => {
  return configStore.theme === 'dark' || 
    (configStore.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
});

// 监听isDarkMode变化
watch(isDarkMode, (newValue) => {
  console.log('isDarkMode变化:', newValue);
  updateThemeClass(newValue);
});

// 更新主题类
function updateThemeClass(isDark: boolean) {
  console.log('更新主题类:', isDark ? 'dark' : 'light');
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(isDark ? 'dark' : 'light');
}

// 初始化操作
onMounted(async () => {
  console.log('App组件挂载');
  // 加载系统配置
  await configStore.fetchConfig();
  
  // 设置系统主题
  updateThemeClass(isDarkMode.value);
  
  // 初始化WebSocket连接
  websocketService.init();
  
  // 监听配置变化
  websocketService.onConfigChange((data) => {
    console.log('收到配置变化事件', data);
    configStore.handleConfigChange(data.config);
  });
});
</script>

<style>
.app-container {
  min-height: 100vh;
  width: 100%;
}
</style> 