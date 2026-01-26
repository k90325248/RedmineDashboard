import type { RedmineUser } from "@/types/Redmine";

import { defineStore } from "pinia";
import getUsersCurrent from "@/utils/redmine/getUsersCurrent";
import { useToast } from "@nuxt/ui/composables";
import useWindowInfo from "@/composables/useWindowInfo";

export const useUserStore = defineStore("user", {
  /** store 的狀態 */
  state: () => ({
    /** 使用者資料 */
    userData: null as RedmineUser | null,
    /** 使用者 API Key */
    apiKey: localStorage.getItem("apiKey") || "",
    /** Redmine Host URL */
    host: localStorage.getItem("host") || "https://redmine01.mitac.com.tw",
  }),
  /** store 的 getter */
  getters: {
    /** 取得使用者資料 */
    getUserData: (state) => state.userData,
    /** 取得使用者 API Key */
    getApiKey: (state) => state.apiKey,
    /** 是否已登入 */
    isLoggedIn: (state) => !!state.apiKey,
  },
  /** store 的行為 */
  actions: {
    /** 設定使用者資料 */
    setUserDate(userData: RedmineUser | null) {
      this.userData = userData;
    },
    /** 更新使用者 API Key */
    updateApiKey(apiKey?: string) {
      if (apiKey) {
        localStorage.setItem("apiKey", apiKey);
      } else {
        localStorage.removeItem("apiKey");
      }
      this.apiKey = localStorage.getItem("apiKey") || "";
    },
    /** 更新 Host */
    updateHost(host: string) {
      localStorage.setItem("host", host);
      this.host = host;
    },
    /** 初始化使用者 (嘗試還原 Session) */
    async initUser(): Promise<boolean> {
      // 若已有資料則不需重抓
      if (this.userData) return true;
      // 沒有 API Key 則不需重抓
      if (!this.apiKey) return false;

      try {
        const { isMainWindow } = useWindowInfo();

        // 取得使用者資料
        const result = await getUsersCurrent({});

        if (result.success) {
          const userData = result.data;
          // 儲存使用者資料
          this.setUserDate(userData);

          if (isMainWindow.value) {
            // 顯示歡迎訊息
            useToast().add({
              color: "success",
              icon: "material-symbols:check-circle",
              title: "歡迎回來!",
              description: `${userData.firstname}`,
              duration: 3000,
            });
          }

          return true;
        } else {
          console.warn("Session restore failed:", result.error);
          // Key 可能失效，但不一定要馬上清除，讓使用者決定是否要重登
          // this.logout();
          return false;
        }
      } catch (err) {
        console.error("Session restore error:", err);
        return false;
      }
    },

    /** 登出 */
    logout() {
      this.updateApiKey();
      this.setUserDate(null);
    },
  },
});
