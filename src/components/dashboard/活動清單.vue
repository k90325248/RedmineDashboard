<template>
  <UCard
    class="h-full"
    :ui="{
      root: 'grid grid-rows-[max-content_1fr] grid-cols-1',
      body: 'grid grid-cols-1 grid-rows-1 overflow-hidden',
    }"
  >
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          議題活動清單
        </h3>
        <span v-if="loading" class="text-sm text-gray-500">載入中...</span>
      </div>
    </template>

    <template #default>
      <div class="flex flex-col gap-4 pr-2 h-full overflow-y-auto">
        <div
          v-if="formattedActivities.length === 0 && !loading"
          class="text-center text-gray-500 py-4"
        >
          沒有找到近60天的議題更動
        </div>

        <div
          v-for="item in formattedActivities"
          :key="item.id"
          class="flex gap-4"
        >
          <div class="relative mt-1">
            <!-- 頭像 -->
            <USkeleton
              v-if="item.id.startsWith('skeleton-')"
              class="w-8 h-8 rounded-full"
            />
            <UAvatar
              v-else
              :alt="item.author.name"
              size="sm"
              :ui="{ background: 'bg-gray-200 dark:bg-gray-700' }"
            />
          </div>
          <div
            class="flex-1 border-b border-gray-300 dark:border-gray-600 pb-4"
          >
            <USkeleton
              v-if="item.id.startsWith('skeleton-')"
              class="w-full h-10 rounded-md"
            />
            <p v-else class="text-sm text-gray-800 dark:text-gray-200">
              <!-- 動作執行者 -->
              <span class="font-semibold">{{ item.author.name }}</span>
              <!-- 動作 -->
              <span class="mx-1 text-gray-500">{{ item.actionText }}</span>
              <!-- 目標 -->
              <a
                v-if="item.url"
                :href="item.url"
                target="_blank"
                class="text-primary font-medium hover:underline cursor-pointer"
              >
                {{ item.targetName }}
              </a>
              <span v-else class="text-gray-800 dark:text-gray-200 font-medium">
                {{ item.targetName }}
              </span>
            </p>

            <!-- 備註 -->
            <p
              class="text-xs text-gray-600 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-800 p-2 rounded"
              v-if="item.notes"
            >
              {{ item.notes }}
            </p>

            <!-- 屬性變更 -->
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
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
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
const formattedActivities = computed<ActivityItem[]>(() => {
  // 塞入六筆 Skeleton
  if (activities.value.length === 0 && loading.value) {
    return Array.from({ length: 3 }).map((_, index) => ({
      id: `skeleton-${index}`,
      author: { name: "", id: -1 },
      icon: "",
      iconClass: "",
      actionText: "",
      targetName: "",
      notes: "",
      details: [],
      timeAgo: "",
      fullTime: "",
      url: "",
      timestamp: 0,
    }));
  }

  return activities.value.map((item) => {
    return {
      ...item,
      timeAgo: dayjs(item.timestamp).fromNow(),
      fullTime: dayjs(item.timestamp).format("YYYY-MM-DD HH:mm:ss"),
    };
  });
});

const controller = new AbortController();

const getIconForType = (type: "note" | "status" | "update" | "create") => {
  switch (type) {
    case "create":
      return {
        icon: "material-symbols:add-circle",
        cls: "text-green-500 bg-green-100",
      };
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

  // Loop 6 times for 60 days
  for (let i = 0; i < 6; i++) {
    if (controller.signal.aborted) break;

    const endDate = today.subtract(i * 10, "day");
    const startDate = endDate.subtract(10, "day");
    const dateFilter = `><${startDate.format("YYYY-MM-DD")}|${endDate.format(
      "YYYY-MM-DD",
    )}`;

    try {
      const issuesResult = await getIssues(
        {
          assigned_to_id: "me", // Only my issues
          updated_on: dateFilter,
          sort: "updated_on:desc",
          limit: 50,
        },
        controller.signal,
      );

      if (issuesResult.success && issuesResult.data.issues.length > 0) {
        const issues = issuesResult.data.issues;

        // Process each issue concurrently and update UI immediately
        const issuePromises = issues.map(async (issue) => {
          // 確保每個 Promise 都能自己消化錯誤
          try {
            // 如果已經取消，直接返回，不要發送請求
            if (controller.signal.aborted) return;

            const newActivities: ActivityItem[] = [];

            // 1. Check for Creation Event
            const createdDate = dayjs(issue.created_on);
            // Check if creation date falls within this chunk's range (roughly)
            // or simply if it was created recently enough to be valid?
            // Since we chunk by 10 days, we should strictly check against the current chunk range
            // to avoid duplicates if iterating, but here we process chunks sequentially.
            // Actually simpler: if created_on is > startDate, it's relevant in this view.
            // But we only want to showing it ONCE.
            // Since we iterate time backwards, we will hit the creation date eventually.
            // We should check if createdDate is between startDate and endDate of this chunk.
            if (
              createdDate.isAfter(startDate) &&
              createdDate.isBefore(endDate.add(1, "day"))
            ) {
              const { icon, cls } = getIconForType("create");
              newActivities.push({
                id: `create-${issue.id}`,
                author: { name: issue.author.name },
                icon,
                iconClass: cls,
                actionText: "新增議題",
                targetName: `#${issue.id} ${issue.subject}`,
                notes: issue.description
                  ? issue.description.substring(0, 100) +
                    (issue.description.length > 100 ? "..." : "")
                  : "",
                timeAgo: createdDate.fromNow(),
                fullTime: createdDate.format("YYYY-MM-DD HH:mm:ss"),
                timestamp: createdDate.valueOf(),
                url: undefined,
              });
            }

            // 2. Fetch Journals
            const detailRes = await getIssue(
              issue.id,
              { include: "journals" },
              controller.signal,
            );
            if (!detailRes.success) {
              // Even if fetching details fails, we might have added the creation event.
              if (newActivities.length > 0) {
                activities.value = [...activities.value, ...newActivities].sort(
                  (a, b) => b.timestamp - a.timestamp,
                );
              }
              return;
            }

            const detailedIssue = detailRes.data.issue;
            if (detailedIssue.journals) {
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
                          Number(oldVal),
                        );
                        if (vRes.exists) oldVal = vRes.value;
                      }
                      if (newVal) {
                        const vRes = redmineStore.getIssueIdMapValue(
                          Number(newVal),
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
            }

            // Update activities immediately for this issue
            if (newActivities.length > 0) {
              activities.value = [...activities.value, ...newActivities].sort(
                (a, b) => b.timestamp - a.timestamp,
              );
            }
          } catch (err: any) {
            if (controller.signal.aborted) {
              return; // 靜默失敗，解決 Uncaught (in promise)
            }
            // 如果不是取消導致的，才印出來
            console.warn(`Failed to fetch details for issue ${issue.id}`, err);
          }
        });

        // Wait for all issues in this chunk to finish before starting next chunk
        await Promise.allSettled(issuePromises);
      }
    } catch (e) {
      // 這是外層 (getIssues 列表) 的錯誤處理
      if (controller.signal.aborted) {
        console.log("Fetch aborted");
      } else {
        console.error("Failed to fetch activity chunk", e);
      }
    }
  }
  loading.value = false;
};

onMounted(() => {
  fetchActivities();
});

onUnmounted(() => {
  controller.abort();
});
</script>
