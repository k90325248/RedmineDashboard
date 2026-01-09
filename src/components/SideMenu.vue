<template>
  <aside
    class="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 transition-colors duration-200"
  >
    <!-- Logo Header -->
    <div class="p-6">
      <div class="flex items-center gap-3">
        <div
          class="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary"
        >
          <UIcon name="material-symbols:dataset" class="text-2xl" />
        </div>
        <h1
          class="text-xl font-bold tracking-tight text-slate-900 dark:text-white"
        >
          Redmine
        </h1>
      </div>
    </div>

    <!-- Navigation List -->
    <div class="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
      <nav class="flex flex-col gap-1">
        <p
          class="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-4"
        >
          Menu
        </p>

        <RouterLink
          to="/dashboard"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all"
          active-class="bg-primary text-white"
          :class="
            $route.path !== '/dashboard'
              ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              : ''
          "
        >
          <UIcon
            name="material-symbols:dashboard"
            class="text-xl"
            :class="$route.path === '/dashboard' ? 'fill-current' : ''"
          />
          <span class="text-sm font-medium">總覽</span>
        </RouterLink>

        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
        >
          <UIcon name="material-symbols:folder-open" class="text-xl" />
          <span class="text-sm font-medium">專案議題</span>
        </a>

        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
        >
          <UIcon name="material-symbols:timer" class="text-xl" />
          <span class="text-sm font-medium">工時填寫</span>
        </a>

        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
        >
          <UIcon name="material-symbols:upload-file" class="text-xl" />
          <span class="text-sm font-medium">工時匯入</span>
        </a>
      </nav>

      <!-- Projects Section -->
      <nav class="flex flex-col gap-1 mt-6">
        <p
          class="px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2"
        >
          Projects
        </p>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <span class="size-2 rounded-full bg-emerald-500"></span>
          <span class="text-sm font-medium truncate">Mobile App Revamp</span>
        </a>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <span class="size-2 rounded-full bg-blue-500"></span>
          <span class="text-sm font-medium truncate">Web Platform V2</span>
        </a>
        <a
          href="#"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <span class="size-2 rounded-full bg-purple-500"></span>
          <span class="text-sm font-medium truncate">Marketing Site</span>
        </a>
      </nav>
    </div>

    <!-- User Profile Footer -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800">
      <div
        class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
      >
        <UAvatar
          :alt="userData?.lastname"
          size="sm"
          :ui="{ background: 'bg-primary-500 dark:bg-primary-400' }"
        />
        <div class="flex flex-col min-w-0">
          <p
            class="text-sm font-semibold text-slate-900 dark:text-white truncate"
          >
            {{ userData?.firstname }} {{ userData?.lastname }}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ userData?.login }}
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);
</script>
