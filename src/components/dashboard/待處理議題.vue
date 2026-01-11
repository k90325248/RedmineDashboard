<template>
  <UCard :ui="{ body: 'h-32' }">
    <div class="flex flex-col justify-between h-full overflow-hidden group">
      <div class="flex items-start justify-between">
        <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
          待處理議題
        </p>
        <span
          v-if="!diffLoading"
          :class="[
            diff > 0
              ? 'text-rose-500 bg-rose-500/10'
              : diff < 0
              ? 'text-emerald-500 bg-emerald-500/10'
              : 'text-gray-500 bg-gray-500/10',
            'px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1',
          ]"
        >
          <UIcon
            :name="
              diff > 0
                ? 'material-symbols:trending-up'
                : diff < 0
                ? 'material-symbols:trending-down'
                : 'material-symbols:trending-flat'
            "
            class="text-[12px]"
          />
          {{ diff > 0 ? "+" : "" }}{{ diff }}
        </span>
        <USkeleton v-else class="h-5 w-12" />
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
import { ref, onMounted } from "vue";
import { api } from "@/utils/api";

const openIssueCount = ref(0);
const diff = ref(0);
const loading = ref(true);
const diffLoading = ref(true);

const fetchOpenIssueCount = async () => {
  loading.value = true;
  try {
    const res = await api.getIssues({
      assigned_to_id: "me",
      status_id: "open",
      limit: 1,
    });

    if (res.success && res.data) {
      openIssueCount.value = res.data.total_count;
    } else {
      console.error("Failed to fetch open issue count:", res.error);
    }
  } catch (error) {
    console.error("Failed to fetch open issue count:", error);
  } finally {
    loading.value = false;
  }
};

const fetchDiff = async () => {
  diffLoading.value = true;
  try {
    // 過去 7 天建立的議題
    const createdReq = api.getIssues({
      assigned_to_id: "me",
      status_id: "*", // any status
      created_on: ">=t-7d",
      limit: 1,
    });

    // 過去 7 天關閉的議題
    const closedReq = api.getIssues({
      assigned_to_id: "me",
      status_id: "closed",
      closed_on: ">=t-7d",
      limit: 1,
    });

    const [createdRes, closedRes] = await Promise.all([createdReq, closedReq]);

    const createdCount =
      createdRes.success && createdRes.data ? createdRes.data.total_count : 0;
    const closedCount =
      closedRes.success && closedRes.data ? closedRes.data.total_count : 0;

    diff.value = createdCount - closedCount;
  } catch (error) {
    console.error("Failed to fetch issue diff:", error);
  } finally {
    diffLoading.value = false;
  }
};

onMounted(() => {
  fetchOpenIssueCount();
  fetchDiff();
});
</script>
