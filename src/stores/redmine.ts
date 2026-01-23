import { RedmineProject } from "@/types/Redmine";
import getMyActiveProjects from "@/utils/redmine/getMyActiveProjects";
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
    /** Activity 下拉 */
    activityList: [
      "Design",
      "Development",
      "Management",
      "Identify Issue",
      "Verify Issue",
      "Bug",
      "Oversee",
    ],
    /** 使用者擁有的已啟用專案 */
    enabledProjects: null as RedmineProject[] | null,
    /** 是否正在載入"使用者擁有的已啟用專案" */
    isLoadingEnabledProjects: false,
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
    /** 取得使用者擁有的已啟用專案 */
    async getEnabledProjects() {
      // 已有資料 - 直接回傳
      if (!this.isLoadingEnabledProjects && this.enabledProjects) {
        return this.enabledProjects;
      }

      // 等待載入完成的方法
      const waitEnabledProjectsFinish = () => {
        const maxRunTimes = 600;
        let runTimes = 0;

        return new Promise<boolean>((resolve) => {
          let it = setInterval(() => {
            // 限制執行次數
            if (runTimes >= maxRunTimes) {
              clearInterval(it);
              return resolve(false);
            }
            // 等待成功
            if (!this.isLoadingEnabledProjects) {
              clearInterval(it);
              return resolve(true);
            }
            runTimes += 1;
          }, 100);
        });
      };

      // 如果正在載入 - 等待載入完成
      if (this.isLoadingEnabledProjects) {
        const isFinish = await waitEnabledProjectsFinish();
        if (isFinish && this.enabledProjects) return this.enabledProjects;
        return [];
      }

      // 取得專案清單
      this.isLoadingEnabledProjects = true;

      const result = await getMyActiveProjects();
      if (result.success) {
        this.enabledProjects = result.data || null;
      }

      this.isLoadingEnabledProjects = false;

      return this.enabledProjects || [];
    },
  },
});
