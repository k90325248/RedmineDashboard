import { defineStore } from "pinia";

export const useRedmineStore = defineStore("redmine", {
  /** store 的狀態 */
  state: () => ({
    /** 欄位中文對應 */
    fieldMap: {
      status: "狀態",
      priority: "優先權",
      assigned_to: "被分派者",
      "start-date": "開始日期",
      "due-date": "完成日期",
      progress: "完成百分比",
      "estimated-hours": "預估工時",
      "spent-time": "耗用工時",
      cf_1: "SA號碼",
      cf_2: "權重",
      cf_3: "專案進度百分比",
      cf_4: "實際開始日期",
      cf_5: "實際完成日期",
      cf_6: "WBS識別碼",

      New: "新增",
      "In Progress": "進行中",
      Resolved: "已解決",
      Feedback: "待回饋", // 或 "回饋"
      Closed: "已結案",
      Rejected: "已駁回",
      Reopened: "重新開啟",
      "Ready for SIT": "待SIT測試",
      "Ready for Deployment": "待部署",
      "CCB Discussion": "CCB討論中",
      "Moved to Product": "轉為產品",
      "Moved to Customization": "轉為客製化",
      "Requirement Discussion": "需求討論",
    },
    /** Issue 欄位中文對應 */
    issueIdMap: {
      1: "新增",
      2: "進行中",
      3: "待回饋",
      4: "已結案",
      5: "已駁回",
      6: "重新開啟",
      7: "待SIT測試",
      8: "待部署",
      9: "CCB討論中",
      10: "轉為產品",
      11: "轉為客製化",
      12: "需求討論",
    },
  }),
  /** store 的行為 */
  actions: {
    /** 依照key取得value */
    getFieldMapValue(key: string) {
      if (key in this.fieldMap) {
        return {
          exists: true,
          value: this.fieldMap[key as keyof typeof this.fieldMap],
        };
      }
      return { exists: false, value: key };
    },
    /** 依照key取得value */
    getIssueIdMapValue(key: number) {
      if (key in this.issueIdMap) {
        return {
          exists: true,
          value: this.issueIdMap[key as keyof typeof this.issueIdMap],
        };
      }
      return { exists: false, value: String(key) };
    },
  },
});
