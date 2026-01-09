<template>
  <UCard
    :ui="{
      body: 'flex flex-col justify-between h-32 overflow-hidden group',
    }"
  >
    <div class="flex items-start justify-between">
      <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
        逾期任務
      </p>
      <!-- <UBadge color="rose" variant="subtle" size="sm">緊急</UBadge> -->
    </div>
    <div class="flex items-end gap-2 mt-auto">
      <USkeleton v-if="loading" class="h-9 w-12" />
      <p v-else class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ count }}
      </p>
      <p class="text-xs text-gray-400 mb-1">件</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

const count = ref(0);
const loading = ref(true);

onMounted(() => {
  const host = userStore.host;
  const apiKey = userStore.apiKey;

  if (host && apiKey) {
    invoke<number>("dashboard_get_overdue_issue_count", { host, apiKey })
      .then((res) => {
        count.value = res;
        loading.value = false;
      })
      .catch((err) => {
        console.error("Failed to fetch overdue issue count:", err);
        loading.value = false;
      });
  } else {
    loading.value = false;
  }
});
</script>
