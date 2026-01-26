<template>
  <UDashboardGroup id="dashboard-ui">
    <UDashboardSidebar
      mode="slideover"
      :default-size="16"
      :min-size="16"
      :max-size="22"
      resizable
    >
      <!-- Sidebar Header -->
      <template #header>
        <div class="w-full grid grid-cols-[auto_1fr] items-center gap-3">
          <UIcon name="material-symbols:dataset" class="text-2xl" />
          <h1 class="text-xl font-bold tracking-tight truncate">
            MiTAC Redmine
          </h1>
          <!-- <UColorModeSwitch size="xl" /> -->
        </div>
      </template>
      <!-- Sidebar Content -->
      <template #default>
        <template v-for="item in items" :key="item.label">
          <UButton
            :icon="item.icon"
            size="xl"
            color="neutral"
            active-color="primary"
            variant="ghost"
            active-variant="solid"
            :to="item.to"
          >
            {{ item.label }}
          </UButton>
        </template>
      </template>
      <!-- Sidebar Footer -->
      <template #footer>
        <div class="w-full flex flex-col gap-2">
          <!-- <USeparator /> -->
          <!-- 設定 -->
          <UButton
            icon="material-symbols:settings"
            size="xl"
            color="neutral"
            variant="ghost"
            active-variant="solid"
            to="/setting"
          >
            設定
          </UButton>
          <!-- 登出 -->
          <UButton
            class="cursor-pointer"
            icon="material-symbols:logout"
            size="xl"
            color="neutral"
            variant="ghost"
            @click="handleLogout"
          >
            登出
          </UButton>
        </div>
      </template>
    </UDashboardSidebar>

    <!-- Main Content -->
    <UDashboardPanel>
      <!-- Header -->
      <template #header>
        <UDashboardNavbar>
          <template #title>
            <h1 class="text-3xl font-extrabold tracking-tight">{{ title }}</h1>
            <!-- <h1 class="text-xl font-bold tracking-tight truncate">
              {{ title }}
            </h1> -->
          </template>
          <template #right>
            <div class="flex items-center gap-2">
              <UDropdownMenu
                :content="{ align: 'end' }"
                :ui="{ content: 'w-64', itemLabel: 'font-normal' }"
                :items="helpItems"
              >
                <UButton variant="ghost">
                  <UIcon name="ic:round-help-outline" class="size-5" />
                </UButton>
              </UDropdownMenu>
              <UColorModeSwitch size="xl" />
            </div>
          </template>
        </UDashboardNavbar>
      </template>
      <!-- Content -->
      <template v-if="userStore.userData" #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { DropdownMenuItem, NavigationMenuItem } from "@nuxt/ui";

import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const title = computed(() => route.meta.title as string);

// 選單項目
const items: NavigationMenuItem[] = [
  {
    label: "總覽",
    icon: "material-symbols:dashboard",
    to: "/dashboard",
  },
  // {
  //   label: "專案議題",
  //   icon: "material-symbols:folder-open",
  //   to: "/project-issues",
  // },
  {
    label: "工時填寫",
    icon: "material-symbols:timer",
    to: "/work-time",
  },
  // {
  //   label: "工時匯入",
  //   icon: "material-symbols:upload-file",
  //   to: "/work-time-import",
  // },
];
// 說明選單
const helpItems: DropdownMenuItem[] = [
  {
    type: "label",
    label: "快速填寫工時",
    icon: "material-symbols:timer",
    kbds: ["meta", "Shift", "Q"],
  },
  {
    label: "重新整理",
    icon: "material-symbols:refresh",
    kbds: ["F5"],
    onSelect: () => window.location.reload(),
  },
];

// 登出
const handleLogout = () => {
  userStore.logout();
  router.push("/");
  useToast().add({
    color: "success",
    icon: "material-symbols:check-circle",
    title: "已登出",
    duration: 3000,
  });
};
</script>
