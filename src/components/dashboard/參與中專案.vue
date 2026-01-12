<template>
  <UCard
    :ui="{
      body: 'flex flex-col justify-between h-32 w-90 overflow-hidden group',
    }"
  >
    <div class="flex items-start justify-between">
      <p class="text-gray-500 dark:text-gray-400 text-sm font-medium">
        參與中專案
      </p>
    </div>
    <div class="flex items-end gap-2 mt-auto">
      <USkeleton v-if="loading" class="h-9 w-12" />
      <p v-else class="text-3xl font-bold text-gray-900 dark:text-white">
        {{ count }}
      </p>
      <p class="text-xs text-gray-400 mb-1">個</p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import getUsersCurrent from "@/utils/redmine/getUsersCurrent";
import getAllActiveProjects from "@/utils/redmine/getAllActiveProjects";
import _ from "lodash";

const toast = useToast();

// 參與中專案數量
const count = ref(0);
// 是否正在載入
const loading = ref(true);

// 取得使用者參與的專案
const getCurrentUserMemberships = async () => {
  const result = await getUsersCurrent({ params: { include: "memberships" } });
  // 檢查是否成功
  if (!result.success || !result.data.memberships) {
    console.warn("取得使用者參與的專案失敗", result);
    return [];
  }
  return result.data.memberships;
};

// 取得所有啟用中的專案
const getActiveProjects = async () => {
  const result = await getAllActiveProjects();
  // 檢查是否成功
  if (!result.success) {
    console.warn("取得使用者參與的專案失敗", result);
    return [];
  }

  return result.data.projects;
};

onMounted(async () => {
  loading.value = true;

  try {
    // 1. 取得使用者參與的專案
    const memberships = await getCurrentUserMemberships();

    // 2. 取得所有啟用中的專案
    const projectsRes = await getActiveProjects();

    // 3. 取交集：(我的會員專案) ∩ (所有啟用中專案), 所以需要跟 active projects 做交集
    const activeProjectIds = projectsRes.map((p) => p.id);
    const myProjectIds = memberships.map((m) => m.project.id);
    const intersection = _.intersection(myProjectIds, activeProjectIds);

    count.value = intersection.length;
  } catch (error) {
    console.error("[ProjectCount] 取得參與中專案失敗", error);
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "取得參與中專案失敗",
      description: "發生未預期錯誤，請洽系統管理員。",
    });
  } finally {
    loading.value = false;
  }
});
</script>
