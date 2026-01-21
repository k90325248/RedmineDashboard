<template>
  <UCard :ui="{ body: 'h-32' }">
    <div class="flex flex-col justify-between h-full overflow-hidden group">
      <div class="flex items-start justify-between">
        <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
          待處理議題
        </p>
        <USkeleton v-if="diffLoading" class="h-5 w-12" />
        <span
          v-else-if="diff !== 0"
          class="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
          :class="{
            'text-rose-500 bg-rose-500/10': diff > 0,
            'text-emerald-500 bg-emerald-500/10': diff < 0,
          }"
        >
          <UIcon
            :name="`material-symbols:trending-${diff > 0 ? 'up' : 'down'}`"
            class="text-[12px]"
          />
          {{ diff > 0 ? "+" : "" }}{{ diff }}
        </span>
      </div>
      <div class="flex items-end gap-2 mt-auto">
        <USkeleton v-if="loading" class="h-9 w-12" />
        <p v-else class="text-3xl font-bold text-gray-900 dark:text-white">
          {{ openIssueCount }}
        </p>
        <p class="text-xs text-gray-400 mb-1">件</p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import getIssues from "@/utils/redmine/getIssues";
import dayjs from "dayjs";

const toast = useToast();

const controller = new AbortController();

// 待處理議題數量
const openIssueCount = ref(0);
// 是否正在載入待處理議題數量
const loading = ref(true);

// 增減量
const diff = ref(0);
// 是否正在載入增減量
const diffLoading = ref(true);

// 取得待處理議題數量
const getOpenIssueCount = async () => {
  loading.value = true;

  const result = await getIssues(
    {
      assigned_to_id: "me",
      status_id: "open",
      limit: 1,
    },
    controller.signal
  );

  if (result.success) {
    openIssueCount.value = result.data.total_count;
  } else if (!result.abort) {
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得待處理議題數量失敗",
      description: result.error.message,
    });
  }

  loading.value = false;
};

// 取得增減量
const getDiffCount = async () => {
  diffLoading.value = true;

  // 計算 7 天前的日期
  // 計算 7 天前的日期
  const lastWeek = dayjs().subtract(7, "day").format("YYYY-MM-DD");

  // 過去 7 天建立的議題
  const createdReq = getIssues(
    {
      assigned_to_id: "me",
      status_id: "*",
      created_on: `>=${lastWeek}`,
      limit: 1,
    },
    controller.signal
  );

  // 過去 7 天關閉的議題
  const closedReq = getIssues(
    {
      assigned_to_id: "me",
      status_id: "closed",
      closed_on: `>=${lastWeek}`,
      limit: 1,
    },
    controller.signal
  );

  const [createdRes, closedRes] = await Promise.all([createdReq, closedReq]);

  const createdCount = createdRes.success ? createdRes.data.total_count : 0;
  const closedCount = closedRes.success ? closedRes.data.total_count : 0;

  diff.value = createdCount - closedCount;

  diffLoading.value = false;
};

onMounted(() => {
  getOpenIssueCount();
  getDiffCount();
});

onUnmounted(() => {
  controller.abort();
});
</script>
