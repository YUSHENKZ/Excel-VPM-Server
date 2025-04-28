<template>
  <div class="not-found">
    <div class="container">
      <div class="error-code">404</div>
      <h1 class="error-title">页面未找到</h1>
      <p class="error-message">抱歉，您请求的页面不存在或已被移除。</p>
      <div class="error-actions">
        <el-button type="primary" @click="goHome">返回首页</el-button>
        <el-button @click="goBack">返回上一页</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.container {
  text-align: center;
  padding: 40px;
  max-width: 500px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.error-code {
  font-size: 96px;
  font-weight: 700;
  color: #1890FF;
  line-height: 1;
  margin-bottom: 20px;
}

.error-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.error-message {
  font-size: 18px;
  margin-bottom: 32px;
  color: #666;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 深色模式 */
:global(.dark) .not-found {
  background-color: #111827;
}

:global(.dark) .container {
  background-color: #1f2937;
}

:global(.dark) .error-title {
  color: #f9fafb;
}

:global(.dark) .error-message {
  color: #e5e7eb;
}
</style> 