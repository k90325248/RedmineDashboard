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
import { useAppClose } from "./composables/app/useAppClose";
import { useAppUpdate } from "./composables/app/useAppUpdate";

const route = useRoute();

// 設定 layout
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

// 設定 toaster
const toaster = { position: "top-center" };

onMounted(async () => {
  // 設定關閉行為
  await useAppClose();

  // 檢查更新
  useAppUpdate();
});
</script>
