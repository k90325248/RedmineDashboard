<template>
  <div
    class="font-display antialiased text-slate-900 dark:text-white bg-white dark:bg-background-dark selection:bg-primary/30 h-screen w-screen overflow-hidden"
  >
    <div class="flex h-full w-full">
      <!-- 左侧：品牌 & 視覺 -->
      <div class="relative hidden w-1/2 overflow-y-auto bg-[#0B1118] lg:block">
        <div class="flex min-h-full flex-col justify-between p-16">
          <div
            class="absolute inset-0 z-0 opacity-40 pointer-events-none"
            style="
              background-image: radial-gradient(
                  circle at 70% 20%,
                  #137fec 0%,
                  transparent 40%
                ),
                radial-gradient(circle at 0% 100%, #137fec 0%, transparent 50%);
              filter: blur(80px);
            "
          ></div>
          <!-- 應用程式名稱 -->
          <div class="relative z-10 flex items-center gap-3">
            <!-- icon -->
            <div
              class="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-blue-600 shadow-lg shadow-primary/30"
            >
              <UIcon
                class="text-white text-3xl"
                name="material-symbols:grid-view-outline"
              />
            </div>
            <!-- 文字 -->
            <span class="text-2xl font-bold tracking-tight text-white">
              MiTAC Redmine
            </span>
          </div>
          <div class="relative z-10 max-w-xl my-auto py-12">
            <h1 class="text-5xl font-bold leading-tight text-white mb-6">
              管理專案，
              <br />
              <span
                class="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-300"
              >
                無限可能。
              </span>
            </h1>
            <p class="text-lg text-slate-400 leading-relaxed max-w-md">
              安全連線至您的
              Redmine。透過全新的桌面體驗，輕鬆追蹤議題、分析工時，並實現高效協作。
            </p>
          </div>
          <div class="relative z-10 mt-auto pt-12">
            <div
              class="flex flex-wrap items-center gap-y-2 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 w-fit"
            >
              <div
                class="flex items-center gap-2 pr-4 border-r border-white/10 last:border-0"
              >
                <UIcon
                  class="text-green-400 text-2xl"
                  name="material-symbols:check-circle-outline"
                />
                <span class="text-sm font-medium text-white/90">
                  支援 Redmine 4.0+
                </span>
              </div>

              <div
                class="flex items-center gap-2 px-4 border-r border-white/10 last:border-0"
              >
                <UIcon
                  class="text-green-400 text-2xl"
                  name="material-symbols:check-circle-outline"
                />
                <span class="text-sm font-medium text-white/90">
                  安全 OAuth 登入
                </span>
              </div>

              <div class="flex items-center gap-2 pl-4">
                <UIcon
                  class="text-green-400 text-2xl"
                  name="material-symbols:check-circle-outline"
                />
                <span class="text-sm font-medium text-white/90">
                  跨平台支援
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Content Slot -->
      <div
        class="grid place-items-center w-full bg-white dark:bg-[#11171d] lg:w-1/2 relative overflow-y-auto"
      >
        <div class="flex w-full flex-col px-4 sm:px-12 xl:px-32">
          <div class="my-auto w-full">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Clean script
</script>

<style scoped>
/* Scoped styles if needed */
</style>
