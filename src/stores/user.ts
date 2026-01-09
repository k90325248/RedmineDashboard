import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  /** store 的狀態 */
  state: () => ({
    /** 使用者資料 */
    userData: null as UserData | null,
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
    setUserDate(userData: UserData | null) {
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
    /** 初始化使用者 (嘗試還原 Session) */
    async initUser(): Promise<boolean> {
      // 若已有資料則不需重抓
      if (this.userData) return true;
      // 沒有 API Key 則不需重抓
      if (!this.apiKey) return false;

      // 這裡暫時 hardcode host (理想上應該也要存 host)
      // TODO: 將 host 也存入 localStorage
      const host = this.host;
      console.log({
        host,
        encrypted_api_key: this.apiKey,
      });
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        // 呼叫後端 redmine_restore_session
        const result = await invoke<ApiUserResult>("redmine_restore_session", {
          host,
          encryptedApiKey: this.apiKey,
        });

        if (result.success && result.data) {
          this.setUserDate(result.data.user_data);
          this.updateApiKey(result.data.api_key);

          // 登入成功
          useToast().add({
            color: "success",
            icon: "material-symbols:check-circle",
            title: "登入成功!",
            duration: 3000,
          });

          return true;
        } else {
          console.warn("Session restore failed:", result.error);
          this.updateApiKey();
          return false;
        }
      } catch (err) {
        console.error("Session restore error:", err);
        this.updateApiKey();
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
