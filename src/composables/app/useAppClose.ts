import { getCurrentWindow } from "@tauri-apps/api/window";
import { Store } from "@tauri-apps/plugin-store";

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
      if (!store) return;
      const closeToTray = await store.get<boolean>("close_to_tray");
      if (closeToTray) {
        // 阻止預設關閉行為
        event.preventDefault();
        // 隱藏視窗
        await win.hide();
      }
    } catch (error) {
      console.error("Failed to handle close request:", error);
    }
  });
}
