import { getCurrentWindow } from "@tauri-apps/api/window";
import { computed } from "vue";

export default () => {
  const appWindow = getCurrentWindow();

  /** 是否為快速模式 */
  const isQuickWindow = computed(() => appWindow.label === "quick");
  /** 是否為主模式 */
  const isMainWindow = computed(() => appWindow.label === "main");

  return { isQuickWindow, isMainWindow };
};
