<template>
  <UCard
    class="h-full"
    :ui="{
      root: 'grid grid-rows-[max-content_max-content_1fr] grid-cols-1',
      body: 'grid grid-cols-1 grid-rows-1 overflow-hidden',
    }"
  >
    <!-- 標題區塊 -->
    <template #header>
      <div class="flex items-center justify-between overflow-visible">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          每日各專案議題議題耗用時數
        </h3>
        <div class="flex gap-2">
          <UButton
            icon="material-symbols:chevron-left"
            color="gray"
            variant="ghost"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
            @click="prevMonth"
          />
          <span class="text-sm font-medium leading-6 h-max">
            {{ currentMonthLabel }}
          </span>
          <UButton
            icon="material-symbols:chevron-right"
            color="gray"
            variant="ghost"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
            @click="nextMonth"
          />
        </div>
      </div>
    </template>
    <!-- 日曆區塊 -->
    <template #default>
      <div class="grid grid-cols-7 gap-1 text-center mb-2">
        <div
          class="text-xs font-semibold text-gray-400 py-2"
          v-for="day in weekDays"
          :key="day"
        >
          {{ day }}
        </div>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center text-sm">
        <div
          v-for="day in calendarDays"
          :key="day.dateStr"
          class="p-2 rounded-lg cursor-pointer relative"
          :class="[
            !day.isCurrentMonth
              ? 'text-gray-300 dark:text-gray-700'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
            day.isSelected ? 'bg-primary text-white hover:bg-primary' : '',
          ]"
          @click="selectDate(day)"
        >
          {{ day.dayNum }}

          <!-- Loading Icon -->
          <UIcon
            v-if="day.isLoading"
            name="line-md:loading-loop"
            class="absolute bottom-1/2 left-1/2 -translate-x-1/2 translate-y-1/2 size-7 text-primary"
          />

          <!-- Data Dot (Green) -->
          <span
            v-else-if="day.hasData"
            class="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full"
            :class="day.isSelected ? 'bg-white' : 'bg-primary'"
          ></span>
        </div>
      </div>
    </template>
    <!-- 資料區塊 -->
    <template #footer>
      <div v-if="isFooterLoading" class="flex justify-center py-4">
        <UIcon name="svg-spinners:3-dots-fade" class="size-6 text-gray-500" />
      </div>
      <div
        v-else-if="!currentDateData || currentDateData.length === 0"
        class="text-center text-gray-400 py-4 text-sm"
      >
        無工時資料
      </div>
      <div v-else class="space-y-4">
        <div v-for="project in currentDateData" :key="project.id">
          <!-- 專案標題 -->
          <div
            class="flex items-center justify-between font-bold text-gray-900 dark:text-white mb-1"
          >
            <span class="truncate" :title="project.name">{{
              project.name
            }}</span>
            <span
              class="whitespace-nowrap text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
            >
              {{ project.hours }} h
            </span>
          </div>
          <!-- 議題列表 -->
          <div
            class="space-y-1 pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-1"
          >
            <div
              v-for="issue in project.issues"
              :key="issue.id"
              class="flex items-start justify-between text-sm group"
            >
              <div class="flex-1 pr-4">
                <div class="text-gray-700 dark:text-gray-300">
                  <a
                    class="text-primary text-xs mr-1 font-medium hover:underline cursor-pointer"
                    target="_blank"
                    :href="`${userStore.host}/issues/${issue.id}`"
                  >
                    #{{ issue.id }}
                  </a>
                  {{ issue.subject }}
                </div>
              </div>
              <div class="text-gray-500 font-medium whitespace-nowrap">
                {{ issue.hours }} h
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive, onUnmounted } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/zh-tw"; // 匯入繁體中文語系
import getTimeEntries from "@/utils/redmine/getTimeEntries";
import getIssues from "@/utils/redmine/getIssues";
import _ from "lodash";
import formatProjectName from "@/utils/formatProjectName";
import { useUserStore } from "@/stores/user";

dayjs.locale("zh-tw");

const userStore = useUserStore();

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

interface IssueData {
  id: number;
  subject: string;
  hours: number;
}

interface ProjectData {
  id: number;
  name: string;
  hours: number;
  issues: IssueData[];
}

const controller = new AbortController();

// State
const currentMonthBase = ref(dayjs());
const selectedDate = ref(dayjs());

// Cache & Status
// Map<dateString, ProjectData[]>
const monthlyCache = reactive(new Map<string, ProjectData[]>());
// Set<dateString>
const loadingDates = reactive(new Set<string>());

// Computed
const currentMonthLabel = computed(() =>
  currentMonthBase.value.format("YYYY年 M月"),
);

const calendarDays = computed(() => {
  const startOfMonth = currentMonthBase.value.startOf("month");
  const endOfMonth = currentMonthBase.value.endOf("month");
  const startDate = startOfMonth.startOf("week");
  const endDate = endOfMonth.endOf("week");

  const days = [];
  let current = startDate;

  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    const dateStr = current.format("YYYY-MM-DD");
    const data = monthlyCache.get(dateStr);

    days.push({
      dateStr,
      dayNum: current.date(),
      isCurrentMonth: current.isSame(currentMonthBase.value, "month"),
      isToday: current.isSame(dayjs(), "day"),
      isSelected: current.isSame(selectedDate.value, "day"),
      rawDate: current,
      // Status flags
      isLoading: loadingDates.has(dateStr),
      hasData: data && data.length > 0,
    });
    current = current.add(1, "day");
  }

  return days;
});

const currentDateData = computed(() => {
  return monthlyCache.get(selectedDate.value.format("YYYY-MM-DD"));
});

const isFooterLoading = computed(() => {
  return loadingDates.has(selectedDate.value.format("YYYY-MM-DD"));
});

// Methods
const prevMonth = () => {
  currentMonthBase.value = currentMonthBase.value.subtract(1, "month");
};
const nextMonth = () => {
  currentMonthBase.value = currentMonthBase.value.add(1, "month");
};

const selectDate = (day: any) => {
  selectedDate.value = day.rawDate;
  if (!day.isCurrentMonth) {
    currentMonthBase.value = day.rawDate;
  }
};

// Fetch Logic
const fetchDailyIssues = async (date: dayjs.Dayjs) => {
  const dateStr = date.format("YYYY-MM-DD");

  // 如果已經在載入中或已有快取，則跳過 (除非強制刷新，目前沒做)
  if (loadingDates.has(dateStr) || monthlyCache.has(dateStr)) return;

  loadingDates.add(dateStr);

  try {
    // 故意不 await 這裡的 API result 處理，讓 UI 不會被 block？
    // 但因為這是 async function，外部呼叫者(loop) 可以選擇不 await 它
    const result = await getTimeEntries(
      {
        user_id: "me",
        spent_on: dateStr,
        limit: 100,
      },
      controller.signal,
    );

    if (!result.success) {
      // 失敗時設為空陣列，避免無限重試，或可加重試邏輯
      monthlyCache.set(dateStr, []);

      if (result.abort) return;
      console.error(`Fetch failed for ${dateStr}`, result.error);
      return;
    }

    const entries = result.data.time_entries;

    // 收集所有需要查詢詳情的 Issue ID
    const issueIds = new Set<number>();
    entries.forEach((e) => {
      if (e.issue?.id) issueIds.add(e.issue.id);
    });

    // 批量取得 Issue 詳情 (若有 ID)
    const issueMap = new Map<number, string>();
    if (issueIds.size > 0) {
      const issuesResult = await getIssues(
        { issue_id: Array.from(issueIds).join(","), status_id: "*" },
        controller.signal,
      );

      if (issuesResult.success) {
        issuesResult.data.issues.forEach((issue) => {
          issueMap.set(issue.id, issue.subject);
        });
      }
    }

    // Process Data
    const groupedByProject = _.groupBy(entries, (e) => e.project.id);
    const processedData: ProjectData[] = [];

    for (const projectId in groupedByProject) {
      const projectEntries = groupedByProject[projectId];
      const projectInfo = projectEntries[0].project;
      const groupedByIssue = _.groupBy(projectEntries, (e) =>
        e.issue ? e.issue.id : "no_issue",
      );

      const issues: IssueData[] = [];
      for (const issueId in groupedByIssue) {
        const issueEntries = groupedByIssue[issueId];
        const totalHours = _.sumBy(issueEntries, "hours");
        let subject = "其他 (無關聯議題)";
        let id = 0;

        if (issueId !== "no_issue") {
          const entry = issueEntries[0];
          const issueIdNum = entry.issue?.id;

          // 優先使用從 getIssues 查到的 subject，若無則回退到 id
          subject = issueMap.get(issueIdNum) || `Issue #${issueIdNum}`;
          id = Number(issueId);
        } else {
          subject = issueEntries[0].comments || "一般工時";
        }

        issues.push({ id, subject, hours: Math.round(totalHours * 100) / 100 });
      }

      const projectTotalHours = _.sumBy(issues, "hours");
      processedData.push({
        id: Number(projectId),
        name: formatProjectName(projectInfo.name),
        hours: Math.round(projectTotalHours * 100) / 100,
        issues,
      });
    }

    monthlyCache.set(dateStr, processedData);
  } catch (e: any) {
    console.error(e);
  } finally {
    loadingDates.delete(dateStr);
  }
};

const fetchMonthIssues = () => {
  // 取得日曆上顯示的所有日期範圍
  const startOfMonth = currentMonthBase.value.startOf("month");
  const endOfMonth = currentMonthBase.value.endOf("month");
  const startDate = startOfMonth.startOf("week");
  const endDate = endOfMonth.endOf("week");

  let current = startDate;
  while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
    // 並發送出請求
    fetchDailyIssues(current);
    current = current.add(1, "day");
  }
};

// Watchers
watch(
  currentMonthBase,
  () => {
    fetchMonthIssues();
  },
  { immediate: true },
);

// 確保選中的日期也有資料(若是直接跳日期)
watch(selectedDate, (newDate) => {
  fetchDailyIssues(newDate);
});

onUnmounted(() => {
  controller.abort();
});
</script>
