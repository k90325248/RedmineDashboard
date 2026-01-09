<template>
  <UCard :ui="{ body: 'h-32' }">
    <div class="flex flex-col justify-between h-full overflow-hidden group">
      <div
        class="grid grid-cols-[minmax(0,1fr)_max-content] justify-between gap-2"
      >
        <p
          class="text-gray-500 dark:text-gray-400 text-sm font-medium truncate"
        >
          本週累計工時
        </p>
        <!-- <span
          class="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
        >
          <UIcon name="material-symbols:arrow-upward" class="text-[12px]" />
          15%
        </span> -->
      </div>
      <div class="flex items-end gap-2 mt-auto">
        <USkeleton v-if="loading" class="h-9 w-20" />
        <p v-else class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ hours }}
        </p>
        <p class="text-xs text-gray-400 mb-1">/ 40 小時</p>
      </div>
    </div>
    <!-- Mini Progress Bar -->
    <UProgress
      :model-value="loading ? null : hours"
      :max="40"
      size="xs"
      color="primary"
      class="mt-2"
    />
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const hours = ref(0);
const loading = ref(true);

onMounted(() => {
  const host = userStore.host;
  const apiKey = userStore.apiKey;

  if (host && apiKey) {
    invoke<number>("dashboard_get_weekly_hours", { host, apiKey })
      .then((res) => {
        hours.value = res;
        loading.value = false;
      })
      .catch((err) => {
        console.error("Failed to fetch weekly hours:", err);
        loading.value = false;
      });
  } else {
    loading.value = false;
  }
});
</script>
