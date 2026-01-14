<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Latest Updates
        </h3>
        <span class="text-sm text-gray-500" v-if="loading">Loading...</span>
      </div>
    </template>

    <div class="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[350px]">
      <div
        v-if="activities.length === 0 && !loading"
        class="text-center text-gray-500 py-4"
      >
        No recent activities found (last 60 days).
      </div>

      <div v-for="item in activities" :key="item.id" class="flex gap-4">
        <div class="relative mt-1">
          <UAvatar
            :alt="item.author.name"
            size="sm"
            :ui="{ background: 'bg-gray-200 dark:bg-gray-700' }"
          />
          <div
            class="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5"
          >
            <UIcon
              :name="item.icon"
              class="text-[12px] rounded-full p-0.5"
              :class="item.iconClass"
            />
          </div>
        </div>
        <div class="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4">
          <p class="text-sm text-gray-800 dark:text-gray-200">
            <span class="font-semibold">{{ item.author.name }}</span>
            <span class="mx-1 text-gray-500">{{ item.actionText }}</span>
            <a
              v-if="item.url"
              :href="item.url"
              target="_blank"
              class="text-primary font-medium hover:underline cursor-pointer"
            >
              {{ item.targetName }}
            </a>
            <span v-else class="text-gray-800 dark:text-gray-200 font-medium">{{
              item.targetName
            }}</span>
          </p>

          <!-- Journal Notes -->
          <p
            class="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded"
            v-if="item.notes"
          >
            {{ item.notes }}
          </p>

          <!-- Property Changes -->
          <ul
            v-if="item.details && item.details.length > 0"
            class="mt-1 space-y-1"
          >
            <li
              v-for="(detail, idx) in item.details"
              :key="idx"
              class="text-xs text-gray-500 flex items-center gap-1 min-w-0"
            >
              <span
                class="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                {{ detail.prop }}
              </span>
              :
              <span
                class="line-through text-gray-400 truncate max-w-[120px]"
                v-if="detail.oldValue"
                :title="detail.oldValue"
              >
                {{ detail.oldValue }}
              </span>
              <UIcon
                name="material-symbols:arrow-right-alt"
                class="mx-1 align-middle shrink-0"
              />
              <span
                class="font-medium text-primary truncate max-w-[150px]"
                :title="detail.newValue"
              >
                {{ detail.newValue }}
              </span>
            </li>
          </ul>

          <p class="text-[11px] text-gray-400 mt-2" :title="item.fullTime">
            {{ item.timeAgo }}
          </p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/zh-tw";
import getIssues from "@/utils/redmine/getIssues";
import getIssue from "@/utils/redmine/getIssue";
import { useRedmineStore } from "@/stores/redmine";

dayjs.extend(relativeTime);
// dayjs.locale("zh-tw");

/** 期刊細節 */
interface JournalDetail {
  /** 欄位 */
  prop: string;
  /** 舊值 */
  oldValue?: string;
  /** 新值 */
  newValue?: string;
}

/** 活動項目 */
interface ActivityItem {
  /** ID */
  id: string;
  /** 作者 */
  author: { name: string; id?: number };
  /** icon */
  icon: string;
  /** icon class */
  iconClass: string;
  /** 操作文字 */
  actionText: string;
  /** 目標名稱 */
  targetName: string;
  /** 備註 */
  notes?: string;
  /** 期刊細節 */
  details?: JournalDetail[];
  /** 相對時間 */
  timeAgo: string;
  /** 完整時間 */
  fullTime: string;
  /** 鏈結 */
  url?: string;
  /** 時間戳 */
  timestamp: number;
}

const redmineStore = useRedmineStore();

const activities = ref<ActivityItem[]>([]);
const loading = ref(false);

const getIconForType = (type: "note" | "status" | "update") => {
  switch (type) {
    case "note":
      return {
        icon: "material-symbols:comment",
        cls: "text-blue-500 bg-blue-100",
      };
    case "status":
      return {
        icon: "material-symbols:sync-alt",
        cls: "text-amber-500 bg-amber-100",
      };
    default:
      return {
        icon: "material-symbols:edit",
        cls: "text-gray-500 bg-gray-100",
      };
  }
};

const fetchActivities = async () => {
  loading.value = true;
  const today = dayjs();

  for (let i = 0; i < 6; i++) {
    const endDate = today.subtract(i * 10, "day");
    const startDate = endDate.subtract(10, "day");
    const dateFilter = `><${startDate.format("YYYY-MM-DD")}|${endDate.format(
      "YYYY-MM-DD"
    )}`;

    try {
      const issuesResult = await getIssues({
        updated_on: dateFilter,
        sort: "updated_on:desc",
        limit: 50,
      });

      if (issuesResult.success && issuesResult.data.issues.length > 0) {
        const issues = issuesResult.data.issues;

        // Process each issue concurrently and update UI immediately
        const issuePromises = issues.map(async (issue) => {
          const detailRes = await getIssue(issue.id, { include: "journals" });
          if (!detailRes.success) return;

          const detailedIssue = detailRes.data.issue;
          if (!detailedIssue.journals) return;

          const newActivities: ActivityItem[] = [];

          for (const journal of detailedIssue.journals) {
            const journalDate = dayjs(journal.created_on);

            if (
              journalDate.isAfter(endDate.add(1, "day")) ||
              journalDate.isBefore(startDate)
            ) {
              continue;
            }

            let type: "note" | "status" | "update" = "update";
            const journalDetails: JournalDetail[] = [];

            if (journal.notes && journal.notes.trim() !== "") {
              type = "note";
            }

            if (journal.details) {
              for (const d of journal.details) {
                let propLabel = d.name;
                let oldVal = d.old_value;
                let newVal = d.new_value;

                let storeKey = d.name;
                if (d.property === "cf") {
                  storeKey = `cf_${d.name}`;
                } else {
                  if (d.name === "done_ratio") storeKey = "progress";
                  else if (d.name === "status_id") storeKey = "status";
                  else if (d.name === "assigned_to_id")
                    storeKey = "assigned_to";
                  else if (d.name === "priority_id") storeKey = "priority";
                  else storeKey = d.name.replace(/_/g, "-");
                }

                const fieldRes = redmineStore.getFieldMapValue(storeKey);
                if (fieldRes.exists) {
                  propLabel = fieldRes.value;
                } else if (d.property === "cf") {
                  propLabel = `自訂欄位 #${d.name}`;
                }

                if (d.name === "done_ratio") {
                  if (oldVal) oldVal += "%";
                  if (newVal) newVal += "%";
                }

                if (d.name === "status_id") {
                  type = "status";
                  if (oldVal) {
                    const vRes = redmineStore.getIssueIdMapValue(
                      Number(oldVal)
                    );
                    if (vRes.exists) oldVal = vRes.value;
                  }
                  if (newVal) {
                    const vRes = redmineStore.getIssueIdMapValue(
                      Number(newVal)
                    );
                    if (vRes.exists) newVal = vRes.value;
                  }
                }

                journalDetails.push({
                  prop: propLabel,
                  oldValue: oldVal,
                  newValue: newVal,
                });
              }
            }

            if (
              type === "update" &&
              journalDetails.length === 0 &&
              !journal.notes
            )
              continue;

            const { icon, cls } = getIconForType(type);
            let actionText = "updated";
            if (type === "note") actionText = "commented on";
            if (type === "status") actionText = "changed status of";

            newActivities.push({
              id: `journal-${journal.id}`,
              author: { name: journal.user.name || "Unknown" },
              icon,
              iconClass: cls,
              actionText,
              targetName: `#${detailedIssue.id} ${detailedIssue.subject}`,
              notes: journal.notes,
              details: journalDetails,
              timeAgo: journalDate.fromNow(),
              fullTime: journalDate.format("YYYY-MM-DD HH:mm:ss"),
              timestamp: journalDate.valueOf(),
              url: undefined, // Add url if needed
            });
          }

          // Update activities immediately for this issue
          if (newActivities.length > 0) {
            activities.value = [...activities.value, ...newActivities].sort(
              (a, b) => b.timestamp - a.timestamp
            );
          }
        });

        // Wait for all issues in this chunk to finish before starting next chunk
        await Promise.all(issuePromises);
      }
    } catch (e) {
      console.error("Failed to fetch activity chunk", e);
    }
  }
  loading.value = false;
};

onMounted(() => {
  fetchActivities();
});
</script>
