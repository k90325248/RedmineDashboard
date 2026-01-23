import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { confirm, message } from "@tauri-apps/plugin-dialog";
import { useIntervalFn } from "@vueuse/core";

/**
 * 檢查更新
 * @param manual 是否為手動檢查 (手動檢查時，若無更新會提示)
 */
export async function checkForUpdate(manual = false) {
  try {
    const update = await check();
    console.log(update);

    if (update) {
      const yes = await confirm(
        `發現新版本，是否立即更新？\n\n${update.body || "更新內容：\n無"}`,
        { title: "發現新版本", kind: "info" },
      );

      if (yes) {
        await update.downloadAndInstall();
        await relaunch();
      }
    } else if (manual) {
      // 手動檢查且無更新時，提示使用者
      await message("目前已是最新版本。", { title: "檢查更新", kind: "info" });
    }
  } catch (error) {
    console.error("檢查更新失敗:", error);
    if (manual) {
      await message(`檢查更新失敗: ${error}`, { title: "錯誤", kind: "error" });
    }
  }
}

/**
 * 初始化應用程式自動更新檢查
 * 每 1 小時檢查一次
 */
export function useAppUpdate() {
  // 立即檢查一次
  checkForUpdate();

  // 每 1 小時檢查一次
  useIntervalFn(() => {
    checkForUpdate();
  }, 60 * 60 * 1000);
}
