<template>
  <div class="flex flex-col gap-8 mx-auto w-full max-w-[420px] py-10">
    <!-- 應用程式名稱 -->
    <div class="flex items-center gap-3 lg:hidden">
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
      <span class="text-2xl font-bold tracking-tight"> MiTAC Redmine </span>
    </div>
    <!-- 標題 -->
    <div class="grid gap-2">
      <div class="flex items-center gap-3 justify-between">
        <h2 class="text-3xl font-bold tracking-tight">登入</h2>
        <UColorModeSwitch size="xl" />
      </div>
      <p class="text-base text-slate-500 dark:text-slate-400">
        請選擇您的登入方式並輸入相關資料
      </p>
    </div>
    <!-- 安全提示 -->
    <div
      class="flex items-start gap-3 bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/10 rounded-xl p-4"
    >
      <UIcon
        name="material-symbols:verified-user"
        class="text-primary-500 mt-0.5 shrink-0 text-xl self-center"
      />
      <p
        class="text-gray-700 dark:text-gray-300 text-sm font-medium leading-relaxed"
      >
        您的登入資訊將以加密形式安全儲存在您的電腦中，請安心使用。
      </p>
    </div>

    <!-- 切換表單 -->
    <UTabs v-model="activeTab" :items="items" @update:model-value="clearForm">
      <template #credentials>
        <UForm
          class="mt-4 flex flex-col gap-5"
          :schema="credentialsSchema"
          :state="credentialsState"
          @submit="onSubmitCredentialsLogin"
        >
          <!-- Redmine 主機網址 -->
          <UFormField label="Redmine 主機網址" name="host">
            <UInput
              v-model="credentialsState.host"
              type="url"
              size="xl"
              class="w-full"
              variant="soft"
              disabled
            >
              <template #leading>
                <UIcon
                  name="material-symbols:dns-outline"
                  class="text-xl text-gray-400"
                />
              </template>
            </UInput>
          </UFormField>
          <!-- 帳號密碼 -->
          <UFormField label="帳號" name="username">
            <UInput
              v-model="credentialsState.username"
              placeholder="e.g. k90325248"
              type="text"
              size="xl"
              class="w-full"
              variant="soft"
            >
              <template #leading>
                <UIcon
                  name="material-symbols:account-circle"
                  class="text-xl text-gray-400"
                />
              </template>
            </UInput>
          </UFormField>
          <!-- 密碼 -->
          <UFormField label="密碼" name="password">
            <UInput
              v-model="credentialsState.password"
              placeholder="••••••••"
              type="password"
              class="w-full"
              variant="soft"
              size="xl"
            >
              <template #leading>
                <UIcon
                  name="material-symbols:lock"
                  class="text-xl text-gray-400"
                />
              </template>
            </UInput>
          </UFormField>
          <!-- 帳密登入 -->
          <UButton
            class="w-full flex items-center justify-center gap-2 font-semibold cursor-pointer"
            type="submit"
            variant="solid"
            size="xl"
            :loading="loading"
          >
            <span>連線</span>
            <UIcon name="material-symbols:arrow-forward" class="text-lg" />
          </UButton>
        </UForm>
      </template>
      <template #apikey>
        <UForm
          class="mt-4 flex flex-col gap-5"
          :schema="apiKeySchema"
          :state="apiKeyState"
          @submit="onSubmitApiKeyLogin"
        >
          <!-- Redmine 主機網址 -->
          <UFormField label="Redmine 主機網址" name="host">
            <UInput
              v-model="apiKeyState.host"
              type="url"
              size="xl"
              class="w-full"
              disabled
            >
              <template #leading>
                <UIcon
                  name="material-symbols:language"
                  class="text-xl text-gray-400"
                />
              </template>
            </UInput>
          </UFormField>
          <!-- API 金鑰 -->
          <UFormField label="API 金鑰" name="apiKey">
            <template #hint>
              <a
                href="https://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication"
                target="_blank"
                class="text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                如何獲取金鑰?
              </a>
            </template>
            <UInput
              v-model="apiKeyState.apiKey"
              placeholder="貼上您的 API Access Key"
              type="password"
              size="xl"
              class="w-full"
            >
              <template #leading>
                <UIcon
                  name="material-symbols:vpn-key"
                  class="text-xl text-gray-400"
                />
              </template>
            </UInput>
          </UFormField>
          <!-- API 金鑰 -->
          <UFormField class="invisible" label="API 金鑰" name="apiKey">
            <template #hint>
              <a
                href="https://www.redmine.org/projects/redmine/wiki/Rest_api#Authentication"
                target="_blank"
                class="text-xs text-primary-500 hover:text-primary-600 font-medium"
              >
                如何獲取金鑰?
              </a>
            </template>
            <UInput
              v-model="apiKeyState.apiKey"
              placeholder="貼上您的 API Access Key"
              type="password"
              size="xl"
              class="w-full"
            >
              <template #leading>
                <UIcon
                  name="material-symbols:vpn-key"
                  class="text-xl text-gray-400"
                />
              </template>
            </UInput>
          </UFormField>
          <!-- 金鑰登入 -->
          <UButton
            class="w-full flex items-center justify-center gap-2 font-semibold cursor-pointer"
            type="submit"
            variant="solid"
            size="xl"
            :loading="loading"
          >
            <span>連線</span>
            <UIcon name="material-symbols:arrow-forward" class="text-lg" />
          </UButton>
        </UForm>
      </template>
    </UTabs>
  </div>
</template>

<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { fetch } from "@tauri-apps/plugin-http";
import * as v from "valibot";

const HOST = "https://redmine01.mitac.com.tw";
const loading = ref(false);

// 帳號密碼驗證
const credentialsSchema = v.object({
  host: v.pipe(
    v.string("請輸入 Redmine 主機網址"),
    v.nonEmpty("主機網址為必填項目")
  ),
  username: v.pipe(v.string("請輸入帳號"), v.nonEmpty("帳號為必填項目")),
  password: v.pipe(v.string("請輸入密碼"), v.nonEmpty("密碼為必填項目")),
});
type CredentialsSchema = v.InferOutput<typeof credentialsSchema>;
// API Key 驗證
const apiKeySchema = v.object({
  host: v.pipe(
    v.string("請輸入 Redmine 主機網址"),
    v.nonEmpty("主機網址為必填項目")
  ),
  apiKey: v.pipe(
    v.string("請輸入 API Key"),
    v.nonEmpty("API Key 為必填項目"),
    v.length(40, "API Key 長度至少需要 40 個字元")
  ),
});
type ApiKeySchema = v.InferOutput<typeof apiKeySchema>;

const toast = useToast();
const router = useRouter();
const userStore = useUserStore();

// UI 狀態
const activeTab = ref<"credentials" | "apikey">("credentials");
// Tabs 項目
const items = ref<TabsItem[]>([
  {
    label: "帳號密碼",
    icon: "material-symbols:person",
    slot: "credentials",
    value: "credentials",
  },
  {
    label: "API Key",
    icon: "material-symbols:key",
    slot: "apikey",
    value: "apikey",
  },
]);
// 表單資料 - 帳號密碼
const credentialsState = reactive({ host: HOST, username: "", password: "" });
// 表單資料 - API Key
const apiKeyState = reactive({ host: HOST, apiKey: "" });

// 帳號密碼登入
const onSubmitCredentialsLogin = async () => {
  console.log("Credentials Login attempt:", credentialsState);
  await handleLogin(credentialsState, "credentials");
};

// API Key 登入
const onSubmitApiKeyLogin = async () => {
  console.log("API Key Login attempt:", apiKeyState);
  await handleLogin(apiKeyState, "apikey");
};

// 處理登入
const handleLogin = async (
  state: CredentialsSchema | ApiKeySchema,
  type: "credentials" | "apikey"
) => {
  loading.value = true;
  const host = state.host.replace(/\/$/, "");
  const url = `${host}/users/current.json`;

  // 更新 Host (雖然這個頁面目前是固定，但為了未來彈性)
  userStore.updateHost(host);

  let headers: HeadersInit = {};

  if (type === "credentials") {
    // Basic Auth
    const creds = state as CredentialsSchema;
    const auth = btoa(`${creds.username}:${creds.password}`);
    headers = {
      Authorization: `Basic ${auth}`,
    };
  } else {
    // API Key
    const keyState = state as ApiKeySchema;
    headers = {
      "X-Redmine-API-Key": keyState.apiKey,
    };
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
    });

    if (response.ok) {
      const data = (await response.json()) as { user: any };
      console.log("Login Successful!", data);

      // 如果是帳號密碼登入，我們需要 API Key 來做後續操作
      // Redmine /users/current.json 回傳的資料中，必須要有 api_key 欄位
      // 這需要使用者在 Redmine 個人設定頁面開啟 "Show API key" 或管理者權限
      // 如果沒有回傳 api_key，我們可能需要提示使用者改用 API Key 登入，或是在這裡做一些處理
      // 但大多數 Redmine 設定若是允許 Rest API，current user 應該會回傳 api_key

      let apiKey = "";
      if (type === "apikey") {
        apiKey = (state as ApiKeySchema).apiKey;
      } else if (data.user.api_key) {
        apiKey = data.user.api_key;
      } else {
        // Fallback: 如果用帳號密碼登入但沒拿到 API Key，這是個問題
        // 因為後續 API 請求我們都改用 X-Redmine-API-Key 了
        throw new Error(
          "無法取得 API Key，請改用 API Key 方式登入，或確認 Redmine 帳號設定。"
        );
      }

      const userData = { ...data.user, api_key: apiKey };

      toast.add({
        color: "success",
        icon: "material-symbols:check-circle",
        title: "登入成功!",
        duration: 3000,
      });

      userStore.setUserDate(userData);
      userStore.updateApiKey(apiKey);
      router.push({ name: "Dashboard" });
    } else {
      const status = response.status;
      let title = "登入失敗";
      let description = `伺服器回應錯誤 (Status: ${status})`;

      if (status === 401) {
        title = "驗證失敗";
        description = "帳號密碼或 API Key 錯誤";
      }

      userStore.updateApiKey();
      toast.add({
        color: "error",
        icon: "material-symbols:error",
        title,
        description,
      });
    }
  } catch (err: unknown) {
    console.error("Login error:", err);
    userStore.updateApiKey();
    toast.add({
      color: "error",
      icon: "material-symbols:error",
      title: "連線錯誤",
      description:
        err instanceof Error ? err.message : "無法連線至 Redmine 主機",
    });
  } finally {
    loading.value = false;
  }
};

// Modal 關閉後的清理
const clearForm = () => {
  credentialsState.host = "https://redmine01.mitac.com.tw";
  credentialsState.username = "";
  credentialsState.password = "";
  apiKeyState.host = "https://redmine01.mitac.com.tw";
  apiKeyState.apiKey = "";
};
</script>
