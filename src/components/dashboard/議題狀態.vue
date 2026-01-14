<template>
  <UCard class="lg:col-span-1">
    <template #header>
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">議題狀態</h3>
    </template>
    <Chart ref="chart" class="h-64 w-full" />
  </UCard>
</template>

<script lang="ts" setup>
import type { EChartsOption } from "echarts";

import { onMounted, ref } from "vue";
import useChart from "@/composables/useChart";
import getIssues from "@/utils/redmine/getIssues";
import _ from "lodash";
import { useRedmineStore } from "@/stores/redmine";

const toast = useToast();
const redmineStore = useRedmineStore();

// 圖表 DOM
const chart = ref<any | null>(null);

// 基本的圖表設定
const basicOption: EChartsOption = {
  // tooltip: { trigger: "item", valueFormatter: (value) => `${value} 個` },
  legend: { top: 0, left: "center", type: "scroll" },
  grid: { left: 1, right: 1, bottom: 1, top: 1, containLabel: true },
  series: [
    {
      name: "議題狀態",
      type: "pie",
      radius: ["40%", "70%"],
      top: "-20%",
      bottom: 0,
      left: -30,
      right: -30,
      center: ["50%", "63%"],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: "center",
        lineHeight: 30,
        formatter: ({ name, value, percent }) =>
          `${name}\n${value} 個\n${percent}%`,
      },
      emphasis: {
        label: { show: true, fontSize: 20, fontWeight: "bold" },
      },
      labelLine: { show: false },
    },
  ],
};

// 取得圖表資料
const getDataOption = async (): Promise<EChartsOption> => {
  // 並行請求：取得議題列表 與 狀態對照表
  const issuesResult = await getIssues({
    assigned_to_id: "me",
    status_id: "open",
  });

  if (!issuesResult.success) {
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得議題失敗",
      description: issuesResult.error.message,
    });
    return {};
  }

  const issues = issuesResult.data.issues;

  // 依狀態分組 (使用 status.id 較為準確)
  const groupedByStatusId = _.groupBy(issues, (i) => i.status.id);

  // 轉換為 ECharts 資料格式
  const data = Object.keys(groupedByStatusId).map((statusIdStr) => {
    const statusName = groupedByStatusId[statusIdStr][0].status.name;
    const count = groupedByStatusId[statusIdStr].length;
    const displayName = redmineStore.getFieldMapValue(statusName).value;
    return { value: count, name: displayName };
  });

  // 總數 (顯示在中間) - 透過 graphic 或 title 實作較複雜，這裡暫用 Tooltip 顯示
  // 若要模擬原本的設計，可以在 title 顯示總數，但動態更新有點麻煩，先維持基本圓餅圖
  return { series: [{ data }] };
};

// 圖表設定清單
const chartSetupInfoList = [{ basicOption, dataOption: getDataOption }];

// 載入圖表
const { setupAll } = useChart(chart, chartSetupInfoList);

onMounted(() => setupAll());
</script>
