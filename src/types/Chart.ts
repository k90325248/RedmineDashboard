import type { ECharts, EChartsOption } from "echarts";

/** 圖表設定 */
export interface ChartSetupInfo {
  /** 基本設定 */
  basicOption: EChartsOption;
  /** 資料設定 */
  dataOption: (chartInstance: ECharts) => Promise<EChartsOption>;
}
