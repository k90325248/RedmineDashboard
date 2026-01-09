<template>
  <UCard
    :ui="{
      body: 'flex flex-col justify-between h-32 overflow-hidden group',
    }"
  >
    <div class="flex items-start justify-between">
      <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
        待處理議題
      </p>
      <USkeleton v-if="diffLoading" class="h-5 w-10" />
      <span
        v-else-if="diff"
        class="px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1"
        :class="{
          'text-emerald-500 bg-emerald-500/10': diff > 0,
          'text-rose-500 bg-rose-500/10': diff <= 0,
        }"
      >
        <UIcon
          :name="`material-symbols:arrow-${diff > 0 ? 'upward' : 'downward'}`"
          class="text-[12px]"
        />
        {{ diff }}
      </span>
    </div>
    <div class="flex items-end gap-2 mt-auto">
      <USkeleton v-if="loading" class="h-9 w-12" />
      <p v-else class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ openIssueCount }}
      </p>
      <p class="text-xs text-gray-400 mb-1">指派給您</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { invoke } from "@tauri-apps/api/core";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();
const loading = ref(false);
const openIssueCount = ref(0);

const diffLoading = ref(false);
const diff = ref(0);

const fetchOpenIssueCount = async () => {
  if (!userStore.host || !userStore.apiKey) return;

  loading.value = true;
  try {
    const count = await invoke<number>("dashboard_get_open_issue_count", {
      host: userStore.host,
      apiKey: userStore.apiKey,
    });
    openIssueCount.value = count;
  } catch (error) {
    console.error("Failed to fetch open issue count:", error);
  } finally {
    loading.value = false;
  }
};

const fetchDiff = async () => {
  if (!userStore.host || !userStore.apiKey) return;

  diffLoading.value = true;
  try {
    const d = await invoke<number>("dashboard_get_open_issue_diff", {
      host: userStore.host,
      apiKey: userStore.apiKey,
    });
    diff.value = d;
  } catch (error) {
    console.error("Failed to fetch issue diff:", error);
  } finally {
    diffLoading.value = false;
  }
};

// 監聽登入狀態變化，登入後重新抓取
watch(
  () => userStore.isLoggedIn,
  (newVal) => {
    if (newVal) {
      fetchOpenIssueCount();
      fetchDiff();
    }
  }
);

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchOpenIssueCount();
    fetchDiff();
  }
});
</script>
