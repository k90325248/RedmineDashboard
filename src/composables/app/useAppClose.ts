import { getCurrentWindow } from "@tauri-apps/api/window";
import { Store } from "@tauri-apps/plugin-store";
import { exit } from "@tauri-apps/plugin-process";

/**
 * 初始化應用程式關閉行為
 * 讀取設定，決定是否在關閉時縮小到系統列
 */
export async function useAppClose() {
  const win = getCurrentWindow();
  let store: Store | null = null;

  try {
    store = await Store.load("settings.json");
  } catch (e) {
    console.error("Store init failed", e);
  }

  // 設定關閉行為
  await win.onCloseRequested(async (event: any) => {
    try {
      const label = win.label;

      // 快速視窗：一律只隱藏，不影響主程式
      if (label === "quick") {
        event.preventDefault();
        await win.hide();
        return;
      }

      // 主視窗
      if (label === "main") {
        if (!store) return;
        const closeToTray = await store.get<boolean>("close_to_tray");

        if (closeToTray) {
          // 縮小至系統列：阻止預設關閉，改為隱藏
          event.preventDefault();
          await win.hide();
        } else {
          // 直接關閉：允許預設行為，或強制退出
          // 這裡使用 exit(0) 確保所有視窗與背景程序都被終止
          await exit(0);
        }
      }
    } catch (error) {
      console.error("Failed to handle close request:", error);
    }
  });
}
