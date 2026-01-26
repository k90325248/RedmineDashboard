<template>
  <UCard :ui="{ header: 'p-0 sm:px-0' }">
    <template v-if="isQuickMode" #header>
      <div
        class="p-4 sm:px-6 flex items-center gap-2"
        :class="{ 'cursor-move': !isPinned }"
        @mousedown.self="emits('start-drag')"
      >
        <div class="flex-1 flex items-center gap-2 pointer-events-none">
          <UIcon name="i-heroicons-clock" class="size-5" />
          <span class="text-lg font-bold">工時填寫</span>
        </div>
        <UButton
          class="px-4 cursor-pointer"
          type="button"
          variant="ghost"
          :loading="isLoading"
          @click="emits('update:isPinned', !isPinned)"
        >
          <UIcon
            class="size-5"
            :name="isPinned ? 'ri:pushpin-2-fill' : 'ri:pushpin-line'"
          />
        </UButton>
      </div>
    </template>

    <UForm
      class="flex flex-col gap-6"
      :schema="workTimeSchema"
      :state="workState"
      @submit="handleSubmit"
    >
      <!-- 第一行 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <!-- 日期 -->
        <UFormField label="日期" name="date" required>
          <VueDatePicker
            v-model="workState.date"
            :dark="colorMode === 'dark'"
            :input-attrs="{ clearable: false }"
            :time-config="{ enableTimePicker: false }"
            :formats="{ input: 'yyyy/MM/dd E' }"
            model-type="yyyy-MM-dd"
            teleport="body"
            :locale="zhTW"
            year-first
            auto-apply
            :disabled="isLoading"
          />
        </UFormField>
        <!-- 小時 -->
        <UFormField label="小時" name="hours" required>
          <UInputNumber
            v-model="workState.hours"
            class="w-full"
            :ui="{ base: 'h-[46px]' }"
            variant="subtle"
            color="neutral"
            size="xl"
            :step="0.25"
            :min="0"
            :disabled="isLoading"
          />
        </UFormField>
        <!-- 活動 -->
        <UFormField
          class="col-span-2 sm:col-span-1"
          label="活動"
          name="activity"
          required
        >
          <USelectMenu
            v-model="workState.activity"
            class="w-full"
            :ui="{ base: 'h-[46px]' }"
            value-key="value"
            variant="subtle"
            color="neutral"
            size="xl"
            :items="activitiesOptions"
            :loading="isLoading"
            loading-icon="i-lucide-loader"
            :disabled="isLoading"
          />
        </UFormField>
      </div>
      <!-- 專案 -->
      <!-- <UFormField label="專案" name="project">
        <USelectMenu
          v-model="workState.project"
          class="w-full"
          :ui="{ base: 'h-[46px]' }"
          value-key="value"
          variant="subtle"
          color="neutral"
          size="xl"
          :items="projectsOptions"
          :loading="isLoading"
          loading-icon="i-lucide-loader"
          :disabled="isLoading"
        />
      </UFormField> -->
      <!-- 議題 -->
      <UFormField label="議題" name="issue" required>
        <USelectMenu
          v-model="workState.issue"
          class="w-full"
          :ui="{ base: 'h-[46px]' }"
          :filter-fields="['label', 'filterKey']"
          value-key="value"
          variant="subtle"
          color="neutral"
          size="xl"
          :items="issueFilteredOptions"
          :loading="isLoading"
          loading-icon="i-lucide-loader"
          :disabled="isLoading"
        />
      </UFormField>
      <!-- 第三行 -->
      <!-- 備註 -->
      <UFormField label="備註" name="comments">
        <UTextarea
          v-model="workState.comments"
          class="w-full"
          variant="subtle"
          color="neutral"
          size="xl"
          :disabled="isLoading"
          autoresize
        />
      </UFormField>

      <!-- Action Buttons -->
      <div
        class="flex items-center gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-gray-800"
      >
        <UButton
          class="px-6 shadow-lg shadow-primary-500/20 cursor-pointer"
          type="submit"
          submitType="save"
          icon="i-heroicons-check"
          size="lg"
          color="primary"
          variant="solid"
          :loading="isLoading"
        >
          儲存
        </UButton>
        <UButton
          class="px-6 cursor-pointer"
          type="submit"
          submitType="saveAndContinue"
          icon="i-heroicons-plus"
          size="lg"
          color="white"
          variant="solid"
          :loading="isLoading"
        >
          儲存並新增下一天
        </UButton>
        <UButton
          class="ml-auto px-4 cursor-pointer"
          type="button"
          size="lg"
          color="gray"
          variant="ghost"
          :loading="isLoading"
          @click="handleCancel(false, true)"
        >
          清除
        </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, computed } from "vue";
import type { FormSubmitEvent, SelectItem } from "@nuxt/ui";
import { VueDatePicker } from "@vuepic/vue-datepicker";
import { useColorMode } from "@vueuse/core";
import dayjs from "dayjs";
import { zhTW } from "date-fns/locale";
import * as v from "valibot";
import getIssues from "@/utils/redmine/getIssues";
import type {
  RedmineProject,
  RedmineIssue,
  RedmineTimeEntryActivity,
} from "@/types/Redmine";
import getTimeEntryActivities from "@/utils/redmine/getTimeEntryActivities";
import createTimeEntry from "@/utils/redmine/createTimeEntry";
import { useRedmineStore } from "@/stores/redmine";

defineProps({
  // 是否快速模式
  isQuickMode: { type: Boolean, default: false },
  // 是否釘選
  isPinned: { type: Boolean, default: false },
});

const toast = useToast();
const colorMode = useColorMode();
const redmineStore = useRedmineStore();

const emits = defineEmits(["add-entry", "update:isPinned", "start-drag"]);

// 原始資料
const projects = ref<RedmineProject[]>([]);
const issues = ref<RedmineIssue[]>([]);
const activities = ref<RedmineTimeEntryActivity[]>([]);

// 格式化後的資料
const projectsOptions = ref<SelectItem[]>([]);
const issueOptions = ref<SelectItem[]>([]);
const activitiesOptions = ref<SelectItem[]>([]);
const issueFilteredOptions = computed(() => {
  if (!workState.project) return issueOptions.value;
  return issueOptions.value.filter(
    (item: any) => item.projectId === workState.project,
  );
});

// WorkTime 表單驗證
const workTimeSchema = v.object({
  date: v.pipe(v.string("請選擇日期"), v.nonEmpty("日期為必填項目")),
  activity: v.number("請選擇活動"),
  issue: v.number("請選擇議題"),
  hours: v.pipe(v.number("請輸入工時"), v.minValue(0.1, "工時必須大於 0")),
  comments: v.optional(v.string(), ""),
});
type WorkTimeSchema = v.InferOutput<typeof workTimeSchema>;

// Loading 狀態
const isLoading = ref(false);

// 表單資料
const workState = reactive({
  date: dayjs().format("YYYY-MM-DD"),
  activity: undefined as number | undefined,
  project: undefined as number | undefined,
  issue: undefined as number | undefined,
  hours: 0,
  comments: "",
});
// 預設活動
const defaultActivity = ref<number | undefined>(undefined);

// 取得活動列表
const getActivitiesList = async () => {
  const res = await getTimeEntryActivities();
  if (res.success) {
    activities.value = res.data.time_entry_activities;
    defaultActivity.value = activities.value.find((a) => a.is_default)?.id;
    workState.activity = defaultActivity.value;
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
// 取得議題清單
const getIssuesList = async () => {
  // 先取得專案清單
  const pRes = await redmineStore.getEnabledProjects();
  // 再取得議題清單
  const iRes = await getIssues({ assigned_to_id: "me" });
  if (!iRes.success) return false;

  // 原始資料
  projects.value = pRes || [];
  issues.value = iRes.data.issues;

  // 下拉選單資料
  const tempProjectsOptions: SelectItem[] = [];
  const tempIssueOptions: SelectItem[] = [];

  // 處理議題下拉選單
  for (let index = 0; index < projects.value.length; index++) {
    const project = projects.value[index];
    // 尋找該專案的議題
    const projectIssues = issues.value.filter(
      (i) => i.project.id === project.id,
    );
    // 新增專案至下拉選單
    tempProjectsOptions.push({
      label: project.name,
      value: project.id,
      description: `共 ${projectIssues.length} 筆議題`,
    });
    // 處理議題下拉選單
    if (projectIssues.length > 0) {
      // 新增標題至下拉選單
      tempIssueOptions.push({
        type: "label",
        label: project.name,
        filterKey: projectIssues.map((i) => `#${i.id} ${i.subject}`).join(" "),
        projectId: project.id,
      });
      // 新增議題至下拉選單
      for (let index = 0; index < projectIssues.length; index++) {
        const issue = projectIssues[index];
        tempIssueOptions.push({
          label: `#${issue.id} ${issue.subject}`,
          value: issue.id,
          filterKey: `${project.name}`,
          projectId: project.id,
        });
      }
      if (index < projects.value.length - 1) {
        tempIssueOptions.push({ type: "separator" });
      }
    }
  }
  // 更新下拉選單
  projectsOptions.value = tempProjectsOptions;
  issueOptions.value = tempIssueOptions;
};

// 統一處理提交
const handleSubmit = async (event: FormSubmitEvent<WorkTimeSchema>) => {
  // 取得按鈕類型
  const action = event.submitter?.getAttribute("submitType");
  // 執行儲存
  const success = await processSave();

  if (success) {
    if (action === "saveAndContinue") {
      // 重置其他欄位並新增下一天
      handleCancel(true);
    } else {
      // 重置所有欄位
      handleCancel();
    }
  }
};
// 共用儲存邏輯
const processSave = async (): Promise<boolean> => {
  const result = v.safeParse(workTimeSchema, workState);
  if (!result.success) {
    const errors = v.flatten(result.issues);
    const nested = errors.nested || {};
    const firstKey = Object.keys(nested)[0];
    const firstError = firstKey ? nested[firstKey]?.[0] : "請檢查表單欄位";

    toast.add({
      title: "驗證失敗",
      description: firstError || "請檢查表單欄位",
      color: "error",
    });
    return false;
  }

  const payload = {
    time_entry: {
      issue_id: result.output.issue,
      spent_on: result.output.date,
      hours: result.output.hours,
      activity_id: result.output.activity,
      comments: result.output.comments,
    },
  };

  const res = await createTimeEntry(payload);
  if (res.success) {
    toast.add({ title: "成功", description: "工時已儲存", color: "success" });
    emits("add-entry");
    return true;
  } else {
    toast.add({
      title: "失敗",
      description: "儲存失敗，請稍後再試",
      color: "error",
    });
    return false;
  }
};
// 處理取消
const handleCancel = (
  addOneDay: boolean = false,
  resetDate: boolean = false,
) => {
  if (addOneDay) {
    workState.date = dayjs(workState.date, "YYYY-MM-DD")
      .add(1, "day")
      .format("YYYY-MM-DD");
  } else if (resetDate) {
    workState.date = dayjs().format("YYYY-MM-DD");
  }
  // workState.project = undefined;
  // workState.activity = defaultActivity.value;
  // workState.issue = undefined;
  // workState.hours = 0;
  // workState.comments = "";
};

// 初始化資料
onMounted(async () => {
  isLoading.value = true;

  await Promise.all([getIssuesList(), getActivitiesList()]);

  isLoading.value = false;
});

// 監聽專案變化
watch(
  () => workState.project,
  (projectId) => {
    if (projectId && workState.issue) {
      const targetIssue = issues.value.find((i) => i.id === workState.issue);
      if (targetIssue?.project.id !== projectId) {
        workState.issue = undefined;
      }
    }
  },
);
</script>
