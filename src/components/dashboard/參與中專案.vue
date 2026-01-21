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
import getMyActiveProjects from "@/utils/redmine/getMyActiveProjects";

const toast = useToast();

const controller = new AbortController();

// 參與中專案數量
const count = ref(0);
// 是否正在載入
const loading = ref(true);

onMounted(async () => {
  loading.value = true;

  const result = await getMyActiveProjects();

  if (!result.success) {
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得參與中專案失敗",
      description: "發生未預期錯誤，請洽系統管理員。",
    });
    return;
  }
  count.value = result.data!.length;

  loading.value = false;
});

onUnmounted(() => {
  controller.abort();
});
</script>
