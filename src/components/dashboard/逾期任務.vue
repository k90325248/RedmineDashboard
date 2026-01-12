<template>
  <UCard
    :ui="{
      body: 'flex flex-col justify-between h-32 w-90 overflow-hidden group',
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
import getIssues from "@/utils/redmine/getIssues";
import dayjs from "dayjs";

const toast = useToast();

const count = ref(0);
const loading = ref(true);

// 取得逾期任務
const getOverdueIssuesCount = async () => {
  loading.value = true;

  // 計算昨天的日期 (Overdue means due < today <=> due <= yesterday)
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  // due_date <= yesterday
  const result = await getIssues({
    assigned_to_id: "me",
    status_id: "open",
    due_date: `<=${yesterday}`,
    limit: 1,
  });

  if (result.success) {
    count.value = result.data.total_count;
  } else {
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得逾期任務失敗",
      description: result.error.message,
    });
  }

  loading.value = false;
};

// 頁面初始化
onMounted(async () => {
  // 取得逾期任務
  await getOverdueIssuesCount();
});
</script>
