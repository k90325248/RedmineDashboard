<template>
  <div
    class="flex h-screen w-full bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-hidden"
  >
    <!-- 電腦端側邊 -->
    <div class="hidden lg:block w-64 shrink-0 h-full">
      <SideMenu />
    </div>

    <!-- 主要內容 -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- 標題 -->
      <header
        class="h-16 flex items-center justify-between px-8 bg-background-light dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 shrink-0"
      >
        <div class="flex items-center gap-4">
          <!-- 手機端側邊 -->
          <USlideover side="left">
            <UButton
              class="cursor-pointer lg:hidden"
              icon="material-symbols:menu"
              color="gray"
              variant="ghost"
              size="xl"
            />
            <template #content>
              <SideMenu />
            </template>
          </USlideover>
          <h2 class="text-3xl font-bold">總覽</h2>
        </div>
      </header>
      <!-- 內容 -->
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import SideMenu from "@/components/SideMenu.vue";
</script>
