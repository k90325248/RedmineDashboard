<template>
  <UCard
    :ui="{
      body: 'flex flex-col justify-between h-32 overflow-hidden group',
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
import { api } from "@/utils/api";

const count = ref(0);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    // 1. 取得使用者參與的專案 (Memberships)
    const userRes = await api.getCurrentUser("memberships");
    if (!userRes.success || !userRes.data?.memberships) {
      console.error("Failed to fetch user memberships:", userRes.error);
      loading.value = false;
      return;
    }

    const myProjectIds = new Set(
      userRes.data.memberships.map((m) => m.project.id)
    );
    console.log(
      `[ProjectCount] My Memberships Count: ${myProjectIds.size}`,
      myProjectIds
    );

    // 2. 取得所有啟用中的專案
    const projectsRes = await api.getAllActiveProjects();
    if (!projectsRes.success || !projectsRes.data) {
      console.error("Failed to fetch all active projects:", projectsRes.error);
      loading.value = false;
      return;
    }

    // 3. 取交集：(我的會員專案) ∩ (所有啟用中專案)
    // Redmine 的 /users/current.json?include=memberships 回傳的專案可能包含已關閉的
    // 所以需要跟 active projects 做交集
    const activeProjectIds = new Set(projectsRes.data.map((p) => p.id));
    console.log(
      `[ProjectCount] All Active Projects Count: ${activeProjectIds.size}`
    );

    let activeCount = 0;
    myProjectIds.forEach((id) => {
      if (activeProjectIds.has(id)) {
        activeCount++;
      }
    });

    console.log(`[ProjectCount] Calculated Intersection: ${activeCount}`);
    count.value = activeCount;
  } catch (err) {
    console.error("Error in ProjectCount:", err);
  } finally {
    loading.value = false;
  }
});
</script>
