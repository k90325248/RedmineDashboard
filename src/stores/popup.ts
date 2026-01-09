import { defineStore } from "pinia";

export const usePopupStore = defineStore("popup", {
  /** store 的狀態 */
  state: () => ({
    /** 側邊功能清單 */
    showSideMenu: false,
  }),
  /** store 的 getter */
  getters: {
    /** 側邊功能清單 */
    getShowSideMenu: (state) => state.showSideMenu,
  },
  /** store 的行為 */
  actions: {
    /** 開啟側邊功能清單 */
    openSideMenu() {
      this.showSideMenu = true;
    },
    /** 關閉側邊功能清單 */
    closeSideMenu() {
      this.showSideMenu = false;
    },
  },
});
