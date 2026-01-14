<template>
  <UCard class="lg:col-span-2">
    <template #header>
      <div class="flex items-center justify-between overflow-visible">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ selectedLabel }}每日各專案耗用時數
        </h3>
        <USelect
          v-model="value"
          class="w-30"
          :ui="{ base: 'py-1' }"
          variant="none"
          :items="items"
        />
      </div>
    </template>
    <Chart ref="chart" class="h-64 w-full" />
  </UCard>
</template>

<script lang="ts" setup>
import type { EChartsOption } from "echarts";

import { computed, onMounted, ref, watch } from "vue";
import useChart from "@/composables/useChart";
import getTimeEntries from "@/utils/redmine/getTimeEntries";
import dayjs from "dayjs";
import _ from "lodash";
import formatProjectName from "@/utils/formatProjectName";

const toast = useToast();

// 圖表 DOM
const chart = ref<any | null>(null);

// 篩選時間範圍
const value = ref("last_30_days");
const items = [
  { value: "last_30_days", label: "最近30日" },
  { value: "this_month", label: "本月" },
  { value: "this_week", label: "本周" },
];
const selectedLabel = computed(() => {
  return items.find((item) => item.value === value.value)?.label || "";
});

// 基本的圖表設定
const basicOption: EChartsOption = {
  tooltip: {
    trigger: "axis",
    axisPointer: { type: "shadow" },
    appendToBody: true,
    confine: true,
    valueFormatter: (value) => `${value} 小時`,
  },
  legend: { top: 0, type: "scroll" },
  grid: { left: "3%", right: "4%", bottom: 1, containLabel: true },
};

// 取得圖表資料
const cachedTimeEntries = ref<any[] | null>(null);

const getDataOption = async (): Promise<EChartsOption> => {
  // 1. 初始化或檢查快取
  if (!cachedTimeEntries.value) {
    // 計算查詢範圍：前30天 ~ 月底或本週結束(取較晚者)
    // 雖然 API 請求只要起始日即可，但定義清楚有助於理解
    const startRange = dayjs().subtract(29, "day").format("YYYY-MM-DD");
    // const endOfMonth = dayjs().endOf("month");
    // const endOfWeek = dayjs().endOf("week").add(1, "day");
    // const endRangeObj = endOfMonth.isAfter(endOfWeek) ? endOfMonth : endOfWeek; // 未使用

    // 取得工時 (範圍取大於等於起始日)
    const result = await getTimeEntries({
      user_id: "me",
      spent_on: `>=${startRange}`,
      limit: 100, // 確保分頁取得所有資料
    });

    if (!result.success) {
      toast.add({
        color: "error",
        icon: "material-symbols:error",
        title: "取得工時失敗",
        description: result.error.message,
      });
      return {};
    }
    cachedTimeEntries.value = result.data.time_entries;
  }

  // 2. 根據目前下拉選單的值 (value) 決定篩選範圍
  let filterStart = dayjs();
  let filterEnd = dayjs();

  switch (value.value) {
    case "this_month":
      filterStart = dayjs().startOf("month");
      filterEnd = dayjs().endOf("month");
      break;
    case "this_week":
      // 假設週一為第一天
      filterStart = dayjs().startOf("week").add(1, "day");
      filterEnd = dayjs().endOf("week").add(1, "day");
      break;
    case "last_30_days":
    default:
      filterStart = dayjs().subtract(29, "day");
      filterEnd = dayjs();
      break;
  }

  // const startDateStr = filterStart.format("YYYY-MM-DD"); // 未使用
  // const endDateStr = filterEnd.format("YYYY-MM-DD");   // 未使用

  // 3. 篩選資料
  const entries = (cachedTimeEntries.value || []).filter((e) => {
    const d = dayjs(e.spent_on);
    return (
      d.isSame(filterStart, "day") ||
      d.isSame(filterEnd, "day") ||
      (d.isAfter(filterStart, "day") && d.isBefore(filterEnd, "day"))
    );
  });

  // 4. 準備 X 軸日期 (連續日期)
  const daysDiff = filterEnd.diff(filterStart, "day") + 1;
  const xAxisData = Array.from({ length: daysDiff }, (_, i) =>
    filterStart.add(i, "day").format("YYYY-MM-DD")
  );

  // 5. 依專案分組
  const groupedByProject = _.groupBy(entries, (e) =>
    formatProjectName(e.project.name)
  );
  const projectNames = Object.keys(groupedByProject);

  // 6. 建構 Series Data
  const series = projectNames.map((projectName) => {
    const projectEntries = groupedByProject[projectName];
    const groupedByDate = _.groupBy(projectEntries, (e) => e.spent_on);

    const data = xAxisData.map((date) => {
      const dailyEntries = groupedByDate[date] || [];
      return _.sumBy(dailyEntries, "hours");
    });

    return {
      name: projectName,
      type: "bar",
      stack: "total",
      data,
    };
  });

  return {
    xAxis: {
      type: "category",
      data: xAxisData.map((d) => dayjs(d).format("MM/DD")),
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

// 監聽篩選變更
watch(value, async () => {
  if (chart.value && chart.value.chart) {
    chart.value.chart.showLoading();
    const option = await getDataOption();
    chart.value.chart.setOption(option, {
      replaceMerge: ["xAxis", "yAxis", "series"],
    });
    chart.value.chart.hideLoading();
  }
});

onMounted(() => setupAll());
</script>
