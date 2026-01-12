<template>
  <div ref="chartDom"></div>
</template>

<script setup lang="ts">
import * as echarts from "echarts";
import { shallowRef, onMounted, onBeforeUnmount, ref } from "vue";
import { useResizeObserver } from "@vueuse/core";

// 圖表外框 DOM
const chartDom = ref<HTMLElement | null>(null);
// 圖表實例
const chart = shallowRef<echarts.ECharts | null>(null);

// 暴露圖表實例
defineExpose({ chart });

// 更改大小
useResizeObserver(chartDom, () => {
  if (chart.value) {
    chart.value.resize();
  }
});

// 等待圖表渲染
const waitDomRender = (timeoutMs = 3000): Promise<HTMLElement> => {
  return new Promise((resolve, reject) => {
    if (chartDom.value) {
      resolve(chartDom.value);
      return;
    }

    // 重取圖表渲染
    let retryInterval: NodeJS.Timeout | undefined = undefined;

    // 超時處理
    const timer = setTimeout(() => {
      clearInterval(retryInterval);
      reject(new Error("無法取得圖表DOM"));
    }, timeoutMs);

    retryInterval = setInterval(() => {
      if (chartDom.value) {
        clearInterval(retryInterval);
        clearTimeout(timer);
        resolve(chartDom.value);
      }
    }, 100);
  });
};
// 初始化圖表
const setupChart = async () => {
  // 確保DOM存在
  const dom = await waitDomRender();

  // 初始化圖表
  chart.value = echarts.init(dom);
  // 顯示載入中
  chart.value.showLoading("default", { text: "載入中..." });
};

// 頁面載入
onMounted(async () => {
  // 初始化圖表
  await setupChart();
});

// 頁面卸載
onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.dispose();
    chart.value = null;
  }
});
</script>
