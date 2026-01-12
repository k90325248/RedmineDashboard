<template>
  <UCard :ui="{ body: 'h-32 w-90' }">
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
    <!-- 進度條 -->
    <UProgress
      :model-value="loading ? null : hours"
      :max="40"
      size="xs"
      :color="hours > 40 ? 'error' : 'primary'"
      class="mt-2"
    />
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import getTimeEntries from "@/utils/redmine/getTimeEntries";
import dayjs from "dayjs";
import _ from "lodash";

const toast = useToast();

// 累計工時
const hours = ref(0);
// 載入中
const loading = ref(true);

// 取得本週累計工時
const getWeeklyHours = async () => {
  const mondayStr = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");

  // 取得本周工時 (自動處理分頁)
  let offset = 0;
  const limit = 100;
  let totalHours = 0;

  try {
    loading.value = true;

    while (true) {
      const result = await getTimeEntries({
        user_id: "me",
        spent_on: `>=${mondayStr}`,
        limit,
        offset,
      });

      // 錯誤處理
      if (!result.success) {
        toast.add({
          color: "error",
          icon: "material-symbols:error",
          title: "取得本週累計工時失敗",
          description: result.error.message,
        });
        return;
      }

      // 累計工時
      const entries = result.data.time_entries;
      // 使用 lodash sumBy 計算總工時
      totalHours += _.sumBy(entries, "hours");

      // 分頁
      if (offset + entries.length >= result.data.total_count) {
        break;
      }
      offset += limit;
    }

    // 設定結果
    hours.value = totalHours;
  } catch (error) {
    console.error("[取得] 本週累計工時失敗", error);
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得本週累計工時失敗",
      description: "發生未預期錯誤，請洽系統管理員。",
    });
  } finally {
    // 關閉載入中
    loading.value = false;
  }
};

onMounted(async () => {
  // 取得本週工時
  await getWeeklyHours();
});
</script>
