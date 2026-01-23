<template>
  <UCard
    :ui="{ body: 'flex flex-col justify-between h-32 overflow-hidden group' }"
  >
    <div class="flex items-start justify-between">
      <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
        參與中專案
      </p>
    </div>
    <div class="flex items-end gap-2 mt-auto">
      <USkeleton v-if="loading" class="h-9 w-12" />
      <p v-else class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ count }}
      </p>
      <p class="text-xs text-gray-400 mb-1">個</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRedmineStore } from "@/stores/redmine";

const redmineStore = useRedmineStore();

const controller = new AbortController();

// 參與中專案數量
const count = ref(0);
// 是否正在載入
const loading = ref(true);

onMounted(async () => {
  loading.value = true;

  const result = await redmineStore.getEnabledProjects();
  count.value = result.length;

  loading.value = false;
});

onUnmounted(() => {
  controller.abort();
});
</script>
