<template>
  <div class="default-layout">
    <!-- 遮罩层 - 仅在移动设备上显示且侧边栏打开时可见 -->
    <div 
      class="sidebar-overlay" 
      v-if="isMobileSidebarOpen" 
      @click="toggleMobileSidebar"
    ></div>
    
    <!-- 紧凑侧边导航 -->
    <aside class="sidebar" :class="{ 'mobile-open': isMobileSidebarOpen }">
      <div class="logo-container">
        <Logo small />
      </div>
      
      <div class="nav-items">
        <router-link to="/" class="nav-item" :class="{ active: activeMenu === '/' }" @click="closeMobileSidebar">
          <el-tooltip content="首页" placement="right" :effect="isDarkMode ? 'dark' : 'light'">
            <div class="nav-icon">
              <el-icon><HomeFilled /></el-icon>
            </div>
          </el-tooltip>
        </router-link>
        
        <router-link to="/files" class="nav-item" :class="{ active: activeMenu === '/files' }" @click="closeMobileSidebar">
          <el-tooltip content="文件浏览" placement="right" :effect="isDarkMode ? 'dark' : 'light'">
            <div class="nav-icon">
              <el-icon><Folder /></el-icon>
            </div>
          </el-tooltip>
        </router-link>
        
        <router-link to="/settings" class="nav-item" :class="{ active: activeMenu === '/settings' }" @click="closeMobileSidebar">
          <el-tooltip content="系统设置" placement="right" :effect="isDarkMode ? 'dark' : 'light'">
            <div class="nav-icon">
              <el-icon><Setting /></el-icon>
            </div>
          </el-tooltip>
        </router-link>
      </div>
      
      <div class="theme-switch">
        <el-tooltip content="切换主题" placement="right" :effect="isDarkMode ? 'dark' : 'light'">
          <div class="nav-icon" @click="toggleTheme">
            <el-icon v-if="isDarkMode"><Moon /></el-icon>
            <el-icon v-else><Sunny /></el-icon>
          </div>
        </el-tooltip>
      </div>
    </aside>
    
    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 头部导航 -->
      <header class="header">
        <!-- 汉堡菜单按钮 - 仅在小屏幕上显示 -->
        <button class="menu-toggle" @click="toggleMobileSidebar">
          <el-icon><Menu /></el-icon>
        </button>
        
        <div class="header-left">
          <h1 class="page-title">{{ pageTitle }}</h1>
        </div>
      </header>
      
      <!-- 内容区 -->
      <main class="content">
        <slot></slot>
      </main>
      
      <!-- 页脚 -->
      <footer class="footer">
        <p>表格文件预览与数据可视化中间件 &copy; {{ new Date().getFullYear() }}</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useConfigStore } from '@/stores/configStore';
import Logo from '@/components/Logo.vue';

// 导入Element Plus图标
import { HomeFilled, Folder, Setting, Moon, Sunny, Menu } from '@element-plus/icons-vue';

// 路由
const route = useRoute();
const configStore = useConfigStore();

// 移动端侧边栏状态
const isMobileSidebarOpen = ref(false);

// 计算属性
const activeMenu = computed(() => route.path);
const pageTitle = computed(() => route.meta.title || '表格文件预览与数据可视化');
const isDarkMode = computed(() => {
  return configStore.theme === 'dark' || 
    (configStore.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
});

// 切换主题
const toggleTheme = async () => {
  const newTheme = isDarkMode.value ? 'light' : 'dark';
  await configStore.setTheme(newTheme);
};

// 切换移动端侧边栏状态
const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
  
  // 当侧边栏打开时，禁止滚动主体内容
  if (isMobileSidebarOpen.value) {
    document.body.classList.add('sidebar-open');
  } else {
    document.body.classList.remove('sidebar-open');
  }
};

// 关闭移动端侧边栏
const closeMobileSidebar = () => {
  if (isMobileSidebarOpen.value) {
    isMobileSidebarOpen.value = false;
    document.body.classList.remove('sidebar-open');
  }
};
</script>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 64px;
  background-color: var(--el-menu-bg-color);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  z-index: 100;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
}

.logo-container {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0 12px;
  overflow: visible;
}

.nav-items {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px 0;
}

.nav-item {
  height: 48px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  text-decoration: none;
  margin-bottom: 8px;
  transition: all 0.2s;
}

.nav-icon {
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 18px;
  transition: all 0.2s;
}

.nav-item:hover .nav-icon {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-item.active .nav-icon {
  background-color: var(--el-color-primary);
  color: white;
}

.theme-switch {
  padding: 16px 0;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.theme-switch .nav-icon {
  cursor: pointer;
}

.theme-switch .nav-icon:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-left: 64px; /* 添加左侧外边距，等于侧边栏宽度 */
}

.header {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 10;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: none;
  font-size: 22px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  margin-right: 16px;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 500;
  color: #333;
}

.content {
  flex: 1;
  padding: 20px;
  overflow: auto;
}

.footer {
  padding: 16px 20px;
  text-align: center;
  background-color: #fff;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #eee;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
}

/* 深色模式样式 */
html.dark .default-layout {
  background-color: #111827;
}

html.dark .header,
html.dark .footer {
  background-color: #1f2937;
  color: #e5e7eb;
}

html.dark .page-title {
  color: #f9fafb;
}

html.dark .sidebar {
  background-color: #1f2937;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

html.dark .logo-container,
html.dark .theme-switch {
  border-color: rgba(255, 255, 255, 0.05);
}

html.dark .menu-toggle {
  color: #e5e7eb;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .menu-toggle {
    display: block;
  }
  
  .sidebar-overlay {
    display: block;
  }
  
  .main-content {
    margin-left: 0; /* 移动端不需要外边距 */
  }
  
  /* 防止在侧边栏打开时主体内容滚动 */
  :global(body.sidebar-open) {
    overflow: hidden;
  }
}
</style> 