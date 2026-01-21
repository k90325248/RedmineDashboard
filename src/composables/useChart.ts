import type { ChartSetupInfo } from "@/types/Chart";
import type { ECharts, EChartsOption, SetOptionOpts } from "echarts";
import { computed, ref, type Ref } from "vue";

import _ from "lodash";
import { ECBasicOption } from "echarts/types/src/util/types.js";

export default (
  chartRefs: Ref<(Element | null) | (Element | null)[]>,
  chartSetupInfoList: ChartSetupInfo[],
) => {
  const currentChartOption = ref<ECBasicOption>({});

  const chartList = computed(() => {
    if (Array.isArray(chartRefs.value)) {
      return chartRefs.value;
    }
    return [chartRefs.value];
  });

  // 設定圖表資料
  const setChartOption = async (
    chart: Element | null,
    option: EChartsOption,
    setOptions?: SetOptionOpts,
  ) => {
    // 等待圖表渲染
    const chartInstance = await waitDomRender(chart);
    // console.log("chartInstance", chartInstance, option, setOptions);
    // 設定圖表
    chartInstance.setOption(option, setOptions);

    // 儲存圖表資料
    currentChartOption.value = chartInstance.getOption();
  };

  // 等待圖表渲染
  const waitDomRender = (
    targetChart: Element | null,
    timeoutMs = 3000,
  ): Promise<ECharts> => {
    return new Promise((resolve, reject) => {
      if (targetChart && "chart" in targetChart && targetChart?.chart) {
        resolve(targetChart.chart as ECharts);
        return;
      }

      // 重取圖表渲染
      let retryInterval: NodeJS.Timeout | undefined = undefined;

      // 超時處理
      const timer = setTimeout(() => {
        clearInterval(retryInterval);
        reject(new Error("無法取得圖表實例"));
      }, timeoutMs);

      retryInterval = setInterval(() => {
        if (targetChart && "chart" in targetChart && targetChart?.chart) {
          clearInterval(retryInterval);
          clearTimeout(timer);
          resolve(targetChart.chart as ECharts);
        }
      }, 100);
    });
  };

  // 開始產生並設定圖表
  const setup = async (
    chart: Element | null,
    chartSetupInfo: ChartSetupInfo,
  ) => {
    // 等待圖表渲染
    const chartInstance = await waitDomRender(chart);

    // 取得資料
    const dataOption = await chartSetupInfo.dataOption(chartInstance);

    // 設定圖表
    setChartOption(chart, _.merge(chartSetupInfo.basicOption, dataOption));

    // 關閉載入中
    chartInstance.hideLoading();

    // 回傳圖表實例
    return chartInstance;
  };

  // 處理所有圖表
  const setupAll = () => {
    if (chartList.value.length !== chartSetupInfoList.length) {
      useToast().add({
        color: "error",
        icon: "material-symbols:error",
        title: "圖表渲染失敗",
        description: "圖表數量與設定清單長度不符",
      });
      console.warn(
        "圖表數量與設定清單長度不符",
        chartList.value.length,
        chartSetupInfoList.length,
      );
      return;
    }

    chartSetupInfoList.forEach((chartSetupInfo, index) =>
      setup(chartList.value[index], chartSetupInfo),
    );
  };

  return { setupAll, setChartOption };
};
