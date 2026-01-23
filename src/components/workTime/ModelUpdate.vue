<template>
  <UModal
    title="更新該筆工時紀錄"
    :dismissible="!isUpdating"
    :close="{ loading: isUpdating, onClick: () => emit('close', false) }"
  >
    <template #body>
      <div class="flex flex-col gap-4">
        <!-- 專案 (Read-only) -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            專案
          </span>
          <span class="text-sm text-gray-900 dark:text-white">
            {{ workLogEntry.project }}
          </span>
        </div>

        <!-- 議題 (Read-only) -->
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
            <UInput
              v-model="formState.spent_on"
              type="date"
              :disabled="isUpdating"
            />
          </div>
          <!-- 時數 -->
          <div class="flex flex-col gap-1">
            <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
              時數
            </span>
            <!-- <UInput
              v-model="formState.hours"
              type="number"
              step="0.25"
              :disabled="isUpdating"
            >
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-xs"
                  >小時</span
                >
              </template>
            </UInput> -->
            <UInputNumber
              v-model="formState.hours"
              class="w-full"
              color="neutral"
              :step="0.25"
              :min="0"
              :disabled="isUpdating"
            />
          </div>
        </div>

        <!-- 活動 -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            活動
          </span>
          <USelectMenu
            v-model="formState.activity_id"
            :items="activitiesOptions"
            value-key="value"
            :loading="isLoadingActivities"
            :disabled="isUpdating"
          />
        </div>

        <!-- 備註 -->
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-gray-500 dark:text-gray-400">
            備註
          </span>
          <UTextarea
            v-model="formState.comments"
            :rows="2"
            :disabled="isUpdating"
            placeholder="填寫備註..."
          />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          color="neutral"
          variant="ghost"
          label="取消"
          :loading="isUpdating"
          @click="emit('close', false)"
        />
        <UButton
          color="primary"
          variant="solid"
          label="儲存"
          :loading="isUpdating"
          @click="handleUpdate"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { RedmineTimeEntry, RedmineTimeEntryActivity } from "@/types/Redmine";
import updateTimeEntry from "@/utils/redmine/updateTimeEntry";
import getTimeEntryActivities from "@/utils/redmine/getTimeEntryActivities";
import { SelectItem } from "@nuxt/ui";

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
  originalData: { entry: RedmineTimeEntry };
}

const userStore = useUserStore();
const toast = useToast();

const props = defineProps<{ workLogEntry: WorkLogEntry }>();

const emit = defineEmits<{ close: [boolean] }>();

const isUpdating = ref(false);
const isLoadingActivities = ref(false);
const activities = ref<RedmineTimeEntryActivity[]>([]);

const activitiesOptions = ref<SelectItem[]>([]);

const formState = reactive({
  spent_on: props.workLogEntry.date,
  hours: props.workLogEntry.hours,
  activity_id: props.workLogEntry.originalData.entry.activity.id,
  comments: props.workLogEntry.originalData.entry.comments || "",
});

// 取得活動列表
const getActivitiesList = async () => {
  const res = await getTimeEntryActivities();
  if (res.success) {
    activities.value = res.data.time_entry_activities;
  }

  const tempActivitiesOptions: SelectItem[] = [];

  // 處理活動下拉選單
  for (let index = 0; index < activities.value.length; index++) {
    const activity = activities.value[index];
    tempActivitiesOptions.push({
      label: activity.name,
      value: activity.id,
    });
  }
  // 更新下拉選單
  activitiesOptions.value = tempActivitiesOptions;
};
// 更新工時紀錄
const handleUpdate = async () => {
  isUpdating.value = true;
  const payload = {
    time_entry: {
      spent_on: formState.spent_on,
      hours: Number(formState.hours),
      activity_id: formState.activity_id,
      comments: formState.comments,
    },
  };

  const res = await updateTimeEntry(props.workLogEntry.id, payload);

  if (res.success) {
    toast.add({
      title: "更新成功",
      description: "工時紀錄已更新",
      color: "success",
    });
    emit("close", true);
  } else {
    toast.add({
      title: "更新失敗",
      description: "無法更新工時紀錄",
      color: "error",
    });
  }
  isUpdating.value = false;
};

onMounted(() => {
  getActivitiesList();
});
</script>
