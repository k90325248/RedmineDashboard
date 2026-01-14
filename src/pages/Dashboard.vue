<template>
  <div class="w-[90%] lg:max-w-7xl mx-auto flex flex-col gap-6">
    <!-- 歡迎文字 -->
    <div class="flex flex-col gap-1 mb-2">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        嗨，{{ userData.firstname }}！很高興見到你 👋
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        看看今天有哪些專案任務需要處理吧。
      </p>
    </div>
    <!-- 卡片區塊 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 待處理議題 -->
      <OpenIssue />
      <!-- 本週累計工時 -->
      <ThisWeekTime />
      <!-- 逾期任務 -->
      <OverdueTask />
      <!-- 參與中專案 -->
      <ParticipatingProjects />
    </div>
    <!-- 圖表區塊 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 本週累計工時 -->
      <ThisWeekTimeStacked />
      <!-- 本週專案議題 -->
      <!-- <ThisWeekIssue /> -->
      <!-- 專案議題狀態 -->
      <IssueStatus />
    </div>
    <!-- 底部區塊 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
      <!-- 每日各專案議題 -->
      <DailyIssueTime />
      <!-- 活動清單 -->
      <ActivityList />
    </div>
  </div>
</template>

<script setup lang="ts">
import OpenIssue from "@/components/dashboard/待處理議題.vue";
import ThisWeekTime from "@/components/dashboard/本週累計工時.vue";
import OverdueTask from "@/components/dashboard/逾期任務.vue";
import ParticipatingProjects from "@/components/dashboard/參與中專案.vue";

import ThisWeekTimeStacked from "@/components/dashboard/每日各專案耗用時數.vue";
import IssueStatus from "@/components/dashboard/議題狀態.vue";
import DailyIssueTime from "@/components/dashboard/每日各專案議題議題耗用時數.vue";
import ActivityList from "@/components/dashboard/活動清單.vue";

import { useUserStore } from "@/stores/user";
import { computed } from "vue";

const userStore = useUserStore();

const userData = computed(() => userStore.userData!);
</script>
