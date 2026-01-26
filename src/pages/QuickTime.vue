<template>
  <TimeEntryForm
    :is-pinned="isPinned"
    is-quick-mode
    @start-drag="handleStartDrag"
    @update:isPinned="handleUpdateIsPinned"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";

import TimeEntryForm from "@/components/workTime/工時填寫.vue";

const win = getCurrentWindow();

const isPinned = ref(false);

// 按下 ESC 鍵時隱藏視窗
const handleKeydown = async (e: KeyboardEvent) => {
  if (!isPinned.value && e.key === "Escape") {
    await win.hide();
  }
};
// 處理拖曳
const handleStartDrag = async () => {
  // 如果是快速模式且未釘選，則允許拖曳
  if (!isPinned.value) {
    // 呼叫後端指令開始拖曳
    await invoke("start_drag");
  }
};
// 處理釘選
const handleUpdateIsPinned = async (value: boolean) => {
  isPinned.value = value;
  await invoke("set_pinned", { pinned: value });
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
/* 自定義滾動條樣式，避免太突兀 */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}
</style>
