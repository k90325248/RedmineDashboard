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
import { api } from "@/utils/api";

const hours = ref(0);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    const res = await api.getWeeklyHours();
    if (res.success && res.data !== undefined) {
      hours.value = res.data;
    } else {
      console.error("Failed to fetch weekly hours:", res.error);
    }
  } catch (err) {
    console.error("Failed to fetch weekly hours:", err);
  } finally {
    loading.value = false;
  }
});
</script>
