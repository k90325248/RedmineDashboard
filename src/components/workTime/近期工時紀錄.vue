<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between px-1">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        近期工時紀錄
      </h3>
      <!-- <UButton
        variant="link"
        color="primary"
        class="text-sm font-medium p-0"
        to="#"
      >
        查看所有紀錄
      </UButton> -->
    </div>

    <UCard class="p-0 sm:p-0">
      <UTable
        ref="table"
        v-model:pagination="pagination"
        :data="recentEntries"
        :columns="columns"
        :empty="isLoading ? '載入中...' : '沒有工時紀錄'"
        :loading="isLoading"
        :pagination-options="{
          getPaginationRowModel: getPaginationRowModel(),
        }"
      >
        <template v-if="isLoading" #date-cell>
          <USkeleton class="h-6 w-24" />
        </template>
        <template v-if="isLoading" #hours-cell>
          <USkeleton class="h-6 w-9" />
        </template>
        <template v-if="isLoading" #issueId-cell>
          <USkeleton class="h-6 w-16" />
        </template>
        <template v-if="isLoading" #issueName-cell>
          <USkeleton class="h-6 w-60" />
        </template>
        <template v-if="isLoading" #project-cell>
          <USkeleton class="h-6 w-132" />
        </template>
        <template v-if="isLoading" #activity-cell>
          <USkeleton class="h-6 w-18" />
        </template>
        <template v-if="isLoading" #actions-cell>
          <USkeleton class="h-6 w-10" />
        </template>
      </UTable>
      <template #footer>
        <div class="w-full flex items-center justify-center">
          <UPagination
            :page="(table?.tableApi?.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui";
import { h, ref, onMounted, resolveComponent, useTemplateRef } from "vue";
import dayjs from "dayjs";
import getTimeEntries from "@/utils/redmine/getTimeEntries";
import { RedmineTimeEntry } from "@/types/Redmine";
import ModelDelete from "./ModelDelete.vue";
import ModelUpdate from "./ModelUpdate.vue";
import getIssues from "@/utils/redmine/getIssues";
import { getPaginationRowModel } from "@tanstack/vue-table";

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

const table = useTemplateRef("table");

const UBadge = resolveComponent("UBadge");
const UButton = resolveComponent("UButton");
const UDropdownMenu = resolveComponent("UDropdownMenu");

const toast = useToast();
const overlay = useOverlay();
const isLoading = ref(false);

const modalDelete = overlay.create(ModelDelete);
const modalUpdate = overlay.create(ModelUpdate);

// 分頁
const pagination = ref({ pageIndex: 0, pageSize: 5 });

// 表格欄位
const columns: TableColumn<WorkLogEntry>[] = [
  {
    accessorKey: "date",
    header: "日期",
    meta: { class: { th: "text-center", td: "text-center font-medium" } },
  },
  {
    accessorKey: "hours",
    header: "時數",
    meta: { class: { th: "text-right", td: "text-right font-medium" } },
    cell: ({ row }) => {
      const formatter = new Intl.NumberFormat("zh-TW", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(row.getValue("hours"));
    },
  },
  {
    accessorKey: "issueId",
    header: "#",
    meta: { class: { th: "text-center", td: "text-center font-medium" } },
  },
  { accessorKey: "issueName", header: "議題" },
  { accessorKey: "project", header: "專案" },
  {
    accessorKey: "activity",
    header: "活動",
    cell: ({ row }) => {
      const color = {
        Development: "info" as const,
        Design: "primary" as const,
        DevOps: "warning" as const,
      }[row.getValue("activity") as string];

      return h(UBadge, { class: "capitalize", variant: "subtle", color }, () =>
        row.getValue("activity"),
      );
    },
  },
  {
    id: "actions",
    header: "操作",
    meta: { class: { td: "text-right" } },
    cell: ({ row: { original } }) => {
      return h(
        UDropdownMenu,
        {
          content: { align: "end" },
          items: [
            {
              label: "編輯",
              icon: "i-lucide-edit",
              onSelect: async () => {
                const instance = modalUpdate.open({ workLogEntry: original });
                const isUpdated = await instance.result;

                if (isUpdated) getRecent30daysEntries();
              },
            },
            {
              label: "刪除",
              icon: "i-lucide-trash",
              color: "error",
              onSelect: async () => {
                const instance = modalDelete.open({ workLogEntry: original });
                const isDeleted = await instance.result;

                if (isDeleted) getRecent30daysEntries();
              },
            },
          ],
          "aria-label": "Actions dropdown",
        },
        () =>
          h(UButton, {
            icon: "i-lucide-ellipsis-vertical",
            color: "neutral",
            variant: "ghost",
            "aria-label": "Actions dropdown",
          }),
      );
    },
  },
];

// 最近30日工時紀錄
const recentEntries = ref<WorkLogEntry[]>([]);

// 取得近30日工時紀錄
const getRecent30daysEntries = async () => {
  isLoading.value = true;
  const fromDate = dayjs().subtract(30, "day").format("YYYY-MM-DD");

  const res = await getTimeEntries({
    user_id: "me",
    from: fromDate,
    limit: 100,
    sort: "spent_on:desc",
  });

  if (res.success) {
    const tempRecentEntries: WorkLogEntry[] = [];

    // 批量取得 Issue 詳情 (若有 ID)
    const issueMap = new Map<number, string>();
    const issueIds = res.data.time_entries.map((entry) => entry.issue.id);
    if (issueIds.length > 0) {
      const issuesResult = await getIssues({
        issue_id: Array.from(issueIds).join(","),
        status_id: "*",
      });
      if (issuesResult.success) {
        issuesResult.data.issues.forEach((issue) => {
          issueMap.set(issue.id, issue.subject);
        });
      }
    }

    for (let index = 0; index < res.data.time_entries.length; index++) {
      const entry = res.data.time_entries[index];

      tempRecentEntries.push({
        id: entry.id,
        date: entry.spent_on,
        project: entry.project.name,
        issueId: entry.issue.id,
        issueName: issueMap.get(entry.issue.id) || "-",
        activity: entry.activity.name,
        hours: entry.hours,
        originalData: { entry },
      });
    }
    recentEntries.value = tempRecentEntries;
  } else {
    toast.add({
      title: "載入失敗",
      description: "無法取得近期工時紀錄",
      color: "red",
    });
    recentEntries.value = [];
  }
  isLoading.value = false;
};

defineExpose({ getRecent30daysEntries });

onMounted(() => {
  getRecent30daysEntries();
});
</script>
