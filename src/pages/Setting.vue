<template>
  <div class="p-4 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">設定</h1>
    </div>

    <!-- 一般設定 -->
    <UCard>
      <template #header>
        <div class="font-semibold">一般</div>
      </template>

      <div class="space-y-6">
        <!-- 關閉時縮小至系統列 -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-gray-900 dark:text-white font-medium">
              關閉時縮小至系統列
            </span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              點擊關閉按鈕時，將應用程式隱藏而非結束
            </span>
          </div>
          <USwitch
            v-model="isCloseToTray"
            :loading="isLoadingSettings"
            @change="saveSettings"
          />
        </div>

        <USeparator />

        <!-- 開機時自動啟動 -->
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-gray-900 dark:text-white font-medium">
                開機時自動啟動
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                登入系統時自動啟動應用程式
              </span>
            </div>
            <USwitch
              v-model="isAutostartEnabled"
              :loading="isLoadingAutostart"
              @change="toggleAutostart"
            />
          </div>

          <!-- 啟動時直接縮小至系統列 -->
          <div
            v-if="isAutostartEnabled"
            class="flex items-center justify-between pl-4 border-l-2 border-gray-200 dark:border-gray-700"
          >
            <div class="flex flex-col gap-1">
              <span class="text-gray-900 dark:text-white font-medium">
                啟動時直接縮小至系統列
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400">
                自動啟動後不顯示主視窗
              </span>
            </div>
            <USwitch
              v-model="isStartMinimized"
              :loading="isLoadingSettings"
              @change="saveSettings"
            />
          </div>
        </div>
      </div>
    </UCard>

    <!-- 更新 -->
    <UCard>
      <template #header>
        <div class="font-semibold">更新</div>
      </template>

      <!-- 檢查更新 -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="font-medium">檢查更新</span>
            <span class="text-sm text-gray-500">手動檢查是否有新版本可用</span>
          </div>
          <UButton
            class="cursor-pointer"
            label="檢查更新"
            :loading="isLoadingUpdate"
            @click="startCheckUpdate"
          />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { Store } from "@tauri-apps/plugin-store";
import { checkForUpdate } from "../composables/app/useAppUpdate";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";

let store: Store | null = null;

const toast = useToast();

// 是否開啟 - 自動啟動
const isAutostartEnabled = ref(false);
// 是否開啟 - 關閉時縮小至系統列
const isCloseToTray = ref(false);
// 是否開啟 - 啟動時直接縮小至系統列
const isStartMinimized = ref(false);

// 載入中 - 自動啟動
const isLoadingAutostart = ref(false);
// 載入中 - 設定
const isLoadingSettings = ref(false);
// 載入中 - 檢查更新
const isLoadingUpdate = ref(false);

/** 讀取設定 */
const loadSettings = async () => {
  isLoadingAutostart.value = true;
  isLoadingSettings.value = true;
  try {
    if (!store) {
      store = await Store.load("settings.json");
    }

    // 檢查 Autostart
    isAutostartEnabled.value = await isEnabled();

    // 讀取設定
    const closeToTray = await store.get<boolean>("close_to_tray");
    isCloseToTray.value = closeToTray ?? false;

    const startMinimized = await store.get<boolean>("start_minimized");
    isStartMinimized.value = startMinimized ?? false;
  } catch (error) {
    toast.add({
      color: "error",
      title: "讀取設定失敗",
      description: "Failed to load settings: " + error,
    });
    console.error("Failed to load settings:", error);
  } finally {
    isLoadingAutostart.value = false;
    isLoadingSettings.value = false;
  }
};

/** 切換自動啟動 */
const toggleAutostart = async () => {
  isLoadingAutostart.value = true;
  try {
    if (isAutostartEnabled.value) {
      await enable();
    } else {
      await disable();
    }
  } catch (error) {
    toast.add({
      color: "error",
      title: `自動啟動${isAutostartEnabled.value ? "啟動" : "禁用"}失敗`,
      description: "Failed to toggle autostart: " + error,
    });
    console.error("Failed to toggle autostart:", error);
    isAutostartEnabled.value = !isAutostartEnabled.value;
  } finally {
    isLoadingAutostart.value = false;
  }
};

/** 儲存設定 */
const saveSettings = async () => {
  isLoadingSettings.value = true;
  try {
    if (!store) return;
    // 儲存設定 - 關閉時縮小至系統列
    await store.set("close_to_tray", isCloseToTray.value);
    // 儲存設定 - 啟動時直接縮小至系統列
    await store.set("start_minimized", isStartMinimized.value);
    // 儲存設定
    await store.save();
  } catch (error) {
    toast.add({
      color: "error",
      title: "儲存設定失敗",
      description: "Failed to save settings: " + error,
    });
    console.error("Failed to save settings:", error);
  } finally {
    isLoadingSettings.value = false;
  }
};

/** 檢查更新 */
const startCheckUpdate = async () => {
  isLoadingUpdate.value = true;
  try {
    await checkForUpdate(true);
  } catch (error) {
    toast.add({
      color: "error",
      title: "檢查更新失敗",
      description: "Failed to check update: " + error,
    });
    console.error("Failed to check update:", error);
  } finally {
    isLoadingUpdate.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>
