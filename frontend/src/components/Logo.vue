<template>
  <div class="logo" :class="{ 'logo-small': small }">
    <div class="logo-icon">
      <svg viewBox="0 0 24 24" width="28" height="28" class="data-icon">
        <rect class="table-bg" x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="#1890FF" stroke-width="1.5" />
        <line class="table-line" x1="2" y1="8" x2="22" y2="8" stroke="#1890FF" stroke-width="1.5" />
        <line class="table-line" x1="2" y1="14" x2="22" y2="14" stroke="#1890FF" stroke-width="1.5" />
        <line class="table-line" x1="9" y1="2" x2="9" y2="22" stroke="#1890FF" stroke-width="1.5" />
        <line class="table-line" x1="15" y1="2" x2="15" y2="22" stroke="#1890FF" stroke-width="1.5" />
        <circle class="chart-data" cx="9" cy="14" r="1.5" fill="#1890FF" />
        <circle class="chart-data" cx="15" cy="18" r="1.5" fill="#1890FF" />
        <circle class="chart-data" cx="21" cy="11" r="1.5" fill="#1890FF" />
        <path class="chart-line" d="M9 14L15 18L21 11" fill="none" stroke="#1890FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <span v-if="!small" class="logo-text">数据可视化</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  small: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 100%;
}

.logo-small {
  justify-content: center;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.data-icon {
  overflow: visible;
}

.table-bg, .table-line, .chart-line, .chart-data {
  transition: all 0.3s;
}

.logo-text {
  font-size: 16px;
  font-weight: 500;
  color: #1890FF;
  letter-spacing: 0.5px;
  transition: color 0.3s;
}

.logo-small .data-icon {
  width: 24px;
  height: 24px;
}

:global(.dark) .table-bg, 
:global(.dark) .table-line, 
:global(.dark) .chart-line {
  stroke: #36CFFB;
}

:global(.dark) .chart-data {
  fill: #36CFFB;
}

:global(.dark) .logo-text {
  color: #36CFFB;
}
</style> 