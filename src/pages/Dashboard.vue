<template>
  <div
    class="w-[unset] md:w-[90%] lg:w-[unset] lg:max-w-7xl mx-auto flex flex-col gap-6"
  >
    <!-- 歡迎文字 -->
    <div class="flex flex-col gap-1 mb-2">
      <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
        嗨，{{ userData.firstname }}！很高興見到你 👋
      </h3>
      <p class="text-gray-500 dark:text-gray-400">
        看看今天有哪些專案任務需要處理吧。
      </p>
    </div>
    <!-- 卡片區塊 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 待處理議題 -->
      <OpenIssue />
      <!-- 本週累計工時 -->
      <ThisWeekTime />
      <!-- 逾期任務 -->
      <OverdueTask />
      <!-- 參與中專案 -->
      <ParticipatingProjects />
    </div>
    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Time Tracking Chart -->
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                Weekly Time Distribution
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Hours logged per day vs scheduled
              </p>
            </div>
            <USelect
              :options="['This Week', 'Last Week']"
              model-value="This Week"
              variant="none"
            />
          </div>
        </template>

        <!-- Custom CSS Bar Chart -->
        <div
          class="h-64 w-full flex items-end justify-between gap-2 sm:gap-4 px-2"
        >
          <div
            v-for="(day, index) in chartData"
            :key="index"
            class="flex flex-col items-center gap-2 flex-1 group"
            :class="{ 'opacity-50': day.isWeekend }"
          >
            <div
              class="relative w-full max-w-[40px] bg-gray-100 dark:bg-gray-800 rounded-t-lg h-48 flex items-end overflow-hidden"
            >
              <div
                class="w-full transition-all duration-300 rounded-t-lg relative"
                :class="
                  day.isWeekend
                    ? 'bg-gray-400/50 group-hover:bg-gray-400'
                    : 'bg-primary/80 group-hover:bg-primary'
                "
                :style="{ height: day.height }"
              >
                <div
                  v-if="!day.isWeekend"
                  class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {{ day.value }}
                </div>
              </div>
            </div>
            <span class="text-xs font-medium text-gray-500">{{
              day.label
            }}</span>
          </div>
        </div>
      </UCard>
      <!-- Status Donut Chart -->
      <UCard class="flex flex-col">
        <template #header>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            Issue Status
          </h3>
        </template>

        <div
          class="flex-1 flex items-center justify-center relative min-h-[200px]"
        >
          <!-- SVG Donut Chart -->
          <svg
            class="transform -rotate-90"
            height="200"
            viewBox="0 0 40 40"
            width="200"
          >
            <circle
              class="opacity-20"
              cx="20"
              cy="20"
              fill="transparent"
              r="15.91549430918954"
              stroke="#334155"
              stroke-width="5"
            ></circle>
            <!-- Segment 1: New (Blue) - 25% -->
            <circle
              cx="20"
              cy="20"
              fill="transparent"
              r="15.91549430918954"
              stroke="#3b82f6"
              stroke-dasharray="25 75"
              stroke-dashoffset="0"
              stroke-width="5"
            ></circle>
            <!-- Segment 2: In Progress (Yellow) - 35% -->
            <circle
              cx="20"
              cy="20"
              fill="transparent"
              r="15.91549430918954"
              stroke="#f59e0b"
              stroke-dasharray="35 65"
              stroke-dashoffset="-25"
              stroke-width="5"
            ></circle>
            <!-- Segment 3: Resolved (Green) - 30% -->
            <circle
              cx="20"
              cy="20"
              fill="transparent"
              r="15.91549430918954"
              stroke="#10b981"
              stroke-dasharray="30 70"
              stroke-dashoffset="-60"
              stroke-width="5"
            ></circle>
            <!-- Segment 4: Feedback (Purple) - 10% -->
            <circle
              cx="20"
              cy="20"
              fill="transparent"
              r="15.91549430918954"
              stroke="#8b5cf6"
              stroke-dasharray="10 90"
              stroke-dashoffset="-90"
              stroke-width="5"
            ></circle>
          </svg>
          <div
            class="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span class="text-3xl font-bold text-gray-900 dark:text-white"
              >12</span
            >
            <span class="text-xs text-gray-500 uppercase font-semibold"
              >Total</span
            >
          </div>
        </div>
        <div class="grid grid-cols-2 gap-y-3 gap-x-4 mt-6">
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full bg-blue-500"></span>
            <span class="text-xs text-gray-600 dark:text-gray-300"
              >New (3)</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full bg-amber-500"></span>
            <span class="text-xs text-gray-600 dark:text-gray-300"
              >In Progress (4)</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full bg-emerald-500"></span>
            <span class="text-xs text-gray-600 dark:text-gray-300"
              >Resolved (4)</span
            >
          </div>
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full bg-violet-500"></span>
            <span class="text-xs text-gray-600 dark:text-gray-300"
              >Feedback (1)</span
            >
          </div>
        </div>
      </UCard>
    </div>
    <!-- Bottom Section: Calendar & Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
      <!-- Simple Calendar Widget -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              Calendar
            </h3>
            <div class="flex gap-2">
              <UButton
                icon="material-symbols:chevron-left"
                color="gray"
                variant="ghost"
                size="xs"
                :ui="{ rounded: 'rounded-full' }"
              />
              <span class="text-sm font-medium leading-8">September 2023</span>
              <UButton
                icon="material-symbols:chevron-right"
                color="gray"
                variant="ghost"
                size="xs"
                :ui="{ rounded: 'rounded-full' }"
              />
            </div>
          </div>
        </template>

        <div class="grid grid-cols-7 gap-1 text-center mb-2">
          <div class="text-xs font-semibold text-gray-400 py-2">Su</div>
          <div class="text-xs font-semibold text-gray-400 py-2">Mo</div>
          <div class="text-xs font-semibold text-gray-400 py-2">Tu</div>
          <div class="text-xs font-semibold text-gray-400 py-2">We</div>
          <div class="text-xs font-semibold text-gray-400 py-2">Th</div>
          <div class="text-xs font-semibold text-gray-400 py-2">Fr</div>
          <div class="text-xs font-semibold text-gray-400 py-2">Sa</div>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-sm">
          <!-- Placeholders for previous month -->
          <div class="p-2 text-gray-300 dark:text-gray-700">27</div>
          <div class="p-2 text-gray-300 dark:text-gray-700">28</div>
          <div class="p-2 text-gray-300 dark:text-gray-700">29</div>
          <div class="p-2 text-gray-300 dark:text-gray-700">30</div>
          <div class="p-2 text-gray-300 dark:text-gray-700">31</div>
          <!-- Current month -->
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            1
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            2
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            3
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            4
          </div>
          <div
            class="relative p-2 bg-primary text-white rounded-lg shadow-md cursor-pointer"
          >
            5
            <span
              class="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1 bg-white rounded-full"
            ></span>
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            6
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            7
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            8
          </div>
          <div
            class="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            9
            <span
              class="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-rose-500 rounded-full"
            ></span>
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            10
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            11
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            12
          </div>
          <div
            class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer text-gray-700 dark:text-gray-300"
          >
            13
          </div>
        </div>

        <template #footer>
          <p
            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3"
          >
            Today's Schedule
          </p>
          <div
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 mb-2"
          >
            <div class="w-1 h-8 rounded-full bg-blue-500"></div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                Sprint Planning
              </p>
              <p class="text-xs text-gray-500">10:00 AM - 11:30 AM</p>
            </div>
          </div>
          <div
            class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
          >
            <div class="w-1 h-8 rounded-full bg-purple-500"></div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                Design Review: Dashboard
              </p>
              <p class="text-xs text-gray-500">02:00 PM - 03:00 PM</p>
            </div>
          </div>
        </template>
      </UCard>

      <!-- Activity Feed -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">
              Latest Updates
            </h3>
            <a
              class="text-sm text-primary hover:underline font-medium cursor-pointer"
              >View All</a
            >
          </div>
        </template>

        <div class="flex flex-col gap-4 overflow-y-auto pr-2 max-h-[350px]">
          <!-- Item 1 -->
          <div class="flex gap-4">
            <div class="relative mt-1">
              <UAvatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvs9sk7hgMBtP8z_wqkKlvhw4WJ4bS8pbJZkdryl85zNGIXsUMlVcgOCIX0ndaIgWKlNtmbwqD0x1NBTzCgsD-qhvjKJ4n6xyqiHcKz7cSlV6BkIsGPKSZRDQL1qIFf4sSwKw74zsCv-EbkPWAbREmguBWwOWvRFX6li-Gndn0A7mQHO4AhTILBGRHVzuI8-WWouTty2UNQbrL9mq72nu7YWssysnFhfn2hg9_TYYHusl90EZxSvyK-Svx-J9vlOzM1ZrO1V7KUmiF"
                alt="Sarah Jenkins"
                size="sm"
              />
              <div
                class="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5"
              >
                <UIcon
                  name="material-symbols:edit"
                  class="text-[12px] text-blue-500 bg-blue-100 rounded-full p-0.5"
                />
              </div>
            </div>
            <div
              class="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4"
            >
              <p class="text-sm text-gray-800 dark:text-gray-200">
                <span class="font-semibold">Sarah Jenkins</span> updated issue
                <a
                  class="text-primary font-medium hover:underline cursor-pointer"
                  >#4329</a
                >
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Changed status from <span class="font-medium">New</span> to
                <span class="font-medium text-amber-500">In Progress</span>
              </p>
              <p class="text-[11px] text-gray-400 mt-2">2 hours ago</p>
            </div>
          </div>
          <!-- Item 2 -->
          <div class="flex gap-4">
            <div class="relative mt-1">
              <UAvatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5kUKNeXfOymguEkmhWbhqgRIoTzjNxE43D6Z5L6pf0-d0by65QGYCKh51RDk046JryLHSq0sqwHAEDyqQxxGduXJ0cgY5CzR5OzWTS-B5bWda0-Jt0JdPZYHapUfcID0NMw_aFy7KOj3oVkguGeR5UDLlLBhC0AZr5W5V2C9Ez2cjLFEqRTsdloBKUVRKLMdWTh6yzi-FDNj8Fh5hYwhfeE1HTO7mz3uKsJZvK0uKxZJ3Lg2ZddcRT2lm3JlBnc4vaE5nSFizVfvE"
                alt="Mike Ross"
                size="sm"
              />
              <div
                class="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5"
              >
                <UIcon
                  name="material-symbols:check"
                  class="text-[12px] text-green-500 bg-green-100 rounded-full p-0.5"
                />
              </div>
            </div>
            <div
              class="flex-1 border-b border-gray-100 dark:border-gray-800 pb-4"
            >
              <p class="text-sm text-gray-800 dark:text-gray-200">
                <span class="font-semibold">Mike Ross</span> closed issue
                <a
                  class="text-primary font-medium hover:underline cursor-pointer"
                  >#4301</a
                >
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Login page responsiveness fixed.
              </p>
              <p class="text-[11px] text-gray-400 mt-2">Yesterday at 4:30 PM</p>
            </div>
          </div>
          <!-- Item 3 -->
          <div class="flex gap-4">
            <div class="relative mt-1">
              <UAvatar
                alt="System"
                size="sm"
                :ui="{
                  background: 'bg-indigo-500',
                  text: 'text-white font-bold',
                }"
                text="SYS"
              />
              <div
                class="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5"
              >
                <UIcon
                  name="material-symbols:schedule"
                  class="text-[12px] text-purple-500 bg-purple-100 rounded-full p-0.5"
                />
              </div>
            </div>
            <div class="flex-1 pb-2">
              <p class="text-sm text-gray-800 dark:text-gray-200">
                <span class="font-semibold">System</span>
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Weekly backup completed successfully.
              </p>
              <p class="text-[11px] text-gray-400 mt-2">Yesterday at 2:00 AM</p>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import OpenIssue from "@/components/dashboard/待處理議題.vue";
import ThisWeekTime from "@/components/dashboard/本週累計工時.vue";
import OverdueTask from "@/components/dashboard/逾期任務.vue";
import ParticipatingProjects from "@/components/dashboard/參與中專案.vue";

import { useUserStore } from "@/stores/user";
import { computed } from "vue";

const userStore = useUserStore();

const userData = computed(() => userStore.userData!);

const chartData = [
  { label: "Mon", value: "5.2h", height: "65%", isWeekend: false },
  { label: "Tue", value: "6.8h", height: "85%", isWeekend: false },
  { label: "Wed", value: "3.5h", height: "45%", isWeekend: false },
  { label: "Thu", value: "7.5h", height: "95%", isWeekend: false },
  { label: "Fri", value: "6.0h", height: "75%", isWeekend: false },
  { label: "Sat", value: "0h", height: "0%", isWeekend: true },
  { label: "Sun", value: "0h", height: "0%", isWeekend: true },
];
</script>
