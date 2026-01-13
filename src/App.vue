<template>
  <UApp :toaster="toaster">
    <component :is="layout">
      <RouterView />
    </component>
  </UApp>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import DashboardLayout from "./layouts/dashboard.vue";
import LoginLayout from "./layouts/login.vue";
import { check } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";
import { confirm } from "@tauri-apps/plugin-dialog";

const route = useRoute();

const layout = computed(() => {
  switch (route.meta.layout) {
    case "login":
      return LoginLayout;
    case "dashboard":
      return DashboardLayout;
    default:
      return "div";
  }
});

const toaster = { position: "top-center" };

onMounted(async () => {
  // 檢查更新
  try {
    const update = await check();
    console.log(update);
    if (update) {
      const yes = await confirm(
        `發現新版本 ${update.version}，是否立即更新？\n\n更新內容：\n${
          update.body || "無"
        }`,
        { title: "發現新版本", kind: "info" }
      );

      if (yes) {
        await update.downloadAndInstall();
        await relaunch();
      }
    }
  } catch (error) {
    console.error("檢查更新失敗:", error);
  }
});
</script>
