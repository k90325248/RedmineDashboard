<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <p class="text-base text-gray-500 dark:text-gray-400">
      記錄您的每日工作時間並進行活動分類，以便精確追蹤。
    </p>

    <div class="flex flex-col gap-8">
      <!-- Main Form Card -->
      <WorkTimeForm @add-entry="recentWorkTimeRef?.getRecent30daysEntries" />
      <!-- Recent Entries Table -->
      <RecentWorkTime ref="recentWorkTimeRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import WorkTimeForm from "@/components/workTime/工時填寫.vue";
import RecentWorkTime from "@/components/workTime/近期工時紀錄.vue";
import { useTemplateRef } from "vue";

const recentWorkTimeRef = useTemplateRef("recentWorkTimeRef");
</script>
