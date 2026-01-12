<template>
  <UCard class="lg:col-span-2">
    <template #header>
      <div class="flex items-center justify-between overflow-visible">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          本周每日各專案堆疊圖
        </h3>
        <!-- <USelect v-model="value" :items="items" size="sm" variant="none" /> -->
      </div>
    </template>

    <!-- Custom CSS Bar Chart -->
    <Chart ref="chart" class="h-64 w-full" />
  </UCard>
</template>

<script lang="ts" setup>
import type { EChartsOption } from "echarts";

import { onMounted, ref } from "vue";
import useChart from "@/composables/useChart";
import getTimeEntries from "@/utils/redmine/getTimeEntries";
import dayjs from "dayjs";
import _ from "lodash";
import formatProjectName from "@/utils/formatProjectName";

const toast = useToast();

// 圖表 DOM
const chart = ref<Element | null>(null);

// 基本的圖表設定
const basicOption: EChartsOption = {
  tooltip: { confine: true },
  legend: { top: 40, left: "right" },
  grid: { left: "3%", right: "4%", bottom: 1, containLabel: true },
};

// 取得資料
const getDataOption = async (): Promise<EChartsOption> => {
  // 取得本月的資料
  const startOfMonth = dayjs().startOf("month").format("YYYY-MM-DD");
  // 取得月底的資料
  const endOfMonth = dayjs().endOf("month").format("YYYY-MM-DD");
  // 取得本月的天數
  const daysInMonth = dayjs().daysInMonth();

  // 取得本月工時
  const result = await getTimeEntries({
    user_id: "me",
    spent_on: `>=${startOfMonth}`, // Redmine API 支援 ><= 運算子，這裡取大於等於月初
  });
  // 如果取得失敗
  if (!result.success) {
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得工時失敗",
      description: result.error.message,
    });
    return {};
  }

  // 篩選出本月的資料 (再次確保，雖然 API 已過濾) 並只取到月底
  // 注意: API spent_on >= startOfMonth 可能會包含下個月的資料如果沒設上限，
  // 但通常只取本月的話可以加 <= endOfMonth。這裡為了保險起見，可以加兩個條件
  // Redmine API: spent_on=><2023-01-01|<=2023-01-31 (不確定是否支援 AND)
  // 簡單起見，我們用 >= startOfMonth 取回後，前端再 filter <= endOfMonth (如果不多的話)
  // 或者直接假設使用者不會預填未來的工時太遠。
  // 更好的做法是: spent_on: "><2023-01-01|2023-01-31" (Redmine date range syntax)
  // 但為了相容性，我們先用 client side filter 做精確過濾。
  const entries = result.data.time_entries.filter((e) => {
    const date = dayjs(e.spent_on);
    return (
      date.isAfter(dayjs(startOfMonth).subtract(1, "day")) &&
      date.isBefore(dayjs(endOfMonth).add(1, "day"))
    );
  });

  // 準備 X 軸日期 (1 ~ daysInMonth)
  const xAxisData = Array.from({ length: daysInMonth }, (_, i) =>
    dayjs(startOfMonth).add(i, "day").format("YYYY-MM-DD")
  );

  // 依專案分組
  const groupedByProject = _.groupBy(entries, (e) =>
    formatProjectName(e.project.name)
  );
  const projectNames = Object.keys(groupedByProject);

  // 建構 Series Data
  const series = projectNames.map((projectName) => {
    const projectEntries = groupedByProject[projectName];
    // 依日期分組該專案的工時
    const groupedByDate = _.groupBy(projectEntries, (e) => e.spent_on);

    const data = xAxisData.map((date) => {
      const dailyEntries = groupedByDate[date] || [];
      return _.sumBy(dailyEntries, "hours");
    });

    return {
      name: projectName,
      type: "bar",
      stack: "total", // 堆疊
      // emphasis: { focus: "series" },
      data,
    };
  });

  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" }, // 陰影指示器
      appendToBody: true,
    },
    legend: {
      data: projectNames,
      top: 0,
      type: "scroll", // 如果專案太多，開啟捲動
    },
    xAxis: {
      type: "category",
      data: xAxisData.map((d) => dayjs(d).format("YYYY/MM/DD")), // 顯示 MM/DD
    },
    yAxis: {
      type: "value",
    },
    series: series as any[],
  };
};

// 圖表設定清單
const chartSetupInfoList = [{ basicOption, dataOption: getDataOption }];

// 載入圖表
const { setupAll } = useChart(chart, chartSetupInfoList);

onMounted(() => setupAll());
</script>
