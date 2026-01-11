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
import { api } from "@/utils/api";

const count = ref(0);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    const today = new Date().toISOString().split("T")[0];
    // due_date < today
    const res = await api.getIssues({
      assigned_to_id: "me",
      status_id: "open",
      due_date: `<${today}`,
      limit: 1,
    });

    if (res.success && res.data) {
      count.value = res.data.total_count;
    } else {
      console.error("Failed to fetch overdue issue count:", res.error);
    }
  } catch (err) {
    console.error("Failed to fetch overdue issue count:", err);
  } finally {
    loading.value = false;
  }
});
</script>
