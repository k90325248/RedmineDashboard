<template>
  <UModal
    title="是否確定刪除該筆工時紀錄?"
    description="刪除後無法復原只能重新新增一筆."
    :dismissible="!isDeleting"
    :close="{ loading: isDeleting, onClick: () => emit('close', false) }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <!-- 專案 -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            專案
          </span>
          <span class="text-sm text-gray-900 dark:text-white">
            {{ workLogEntry.project }}
          </span>
        </div>

        <!-- 議題 -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            議題
          </span>
          <span class="text-sm text-gray-900 dark:text-white">
            <a
              :href="`${userStore.host}/issues/${workLogEntry.issueId}`"
              target="_blank"
              class="hover:underline text-primary-500"
            >
              #{{ workLogEntry.issueId }}
            </a>
            {{ workLogEntry.issueName }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- 日期 -->
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
              日期
            </span>
            <span class="text-sm text-gray-900 dark:text-white">
              {{ workLogEntry.date }}
            </span>
          </div>
          <!-- 時數 -->
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
              時數
            </span>
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              {{ workLogEntry.hours }} 小時
            </span>
          </div>
        </div>

        <!-- 活動 -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            活動
          </span>
          <div>
            <UBadge variant="subtle" size="sm">
              {{ workLogEntry.activity }}
            </UBadge>
          </div>
        </div>

        <!-- 備註 -->
        <div
          v-if="workLogEntry.originalData.entry.comments"
          class="flex flex-col gap-1"
        >
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            備註
          </span>
          <div
            class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-2 rounded"
          >
            {{ workLogEntry.originalData.entry.comments }}
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          color="error"
          variant="solid"
          label="刪除"
          :loading="isDeleting"
          @click="deleteWorkLogEntry(workLogEntry.id)"
        />
        <UButton
          color="neutral"
          variant="ghost"
          label="取消"
          :loading="isDeleting"
          @click="emit('close', false)"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { RedmineIssue, RedmineTimeEntry } from "@/types/Redmine";
import deleteTimeEntry from "@/utils/redmine/deleteTimeEntry";

/** 工時紀錄 */
interface WorkLogEntry {
  /** ID */
  id: number;
  /** 日期 */
  date: string;
  /** 議題 ID */
  issueId: number;
  /** 議題名稱 */
  issueName: string;
  /** 專案 */
  project: string;
  /** 活動 */
  activity: string;
  /** 時數 */
  hours: number;
  /** 原始資料 */
  originalData: { entry: RedmineTimeEntry; issueData: RedmineIssue | null };
}

const userStore = useUserStore();
const toast = useToast();

defineProps<{ workLogEntry: WorkLogEntry }>();

const emit = defineEmits<{ close: [boolean] }>();

const isDeleting = ref(false);

// 刪除工時紀錄
const deleteWorkLogEntry = async (id: number) => {
  isDeleting.value = true;
  const res = await deleteTimeEntry(id);

  if (res.success) {
    toast.add({
      title: "刪除成功",
      description: "工時紀錄已刪除",
      color: "success",
    });
    emit("close", true);
  } else {
    toast.add({
      title: "刪除失敗",
      description: "無法刪除工時紀錄",
      color: "error",
    });
  }
  isDeleting.value = false;
};
</script>
