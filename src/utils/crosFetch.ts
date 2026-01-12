import type { ApiReturnData } from "@/types/ApiInteraction";

import { fetch } from "@tauri-apps/plugin-http";
import { useUserStore } from "@/stores/user";

/** 請求參數 */
type FetchOption = {
  /** 請求網址 */
  path: string;
  /** 請求方法 */
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** 請求參數 */
  params?: Record<string, any>;
  /** 請求內容 */
  body?: any;
  /** 標頭 */
  headers?: Record<string, string>;
};

export default async <T>({
  path,
  method = "GET",
  params = {},
  body,
  headers = {},
}: FetchOption): Promise<ApiReturnData<T>> => {
  const store = useUserStore();
  // HOST
  const host = store.host?.replace(/\/$/, "") ?? "";
  // API Key
  const apiKey = store.apiKey;

  // URL
  const url = new URL(`${host}${path}`);
  // 請求參數
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  try {
    // 請求選項
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "X-Redmine-API-Key": apiKey,
        "Content-Type": "application/json",
        ...headers,
      },
    };
    // 請求內容
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // 請求
    const response = await fetch(url.toString(), fetchOptions);

    // 檢查回應
    if (!response.ok) {
      const message = await response.text();
      const errorData = { code: response.status, message };

      console.error(
        `[crosFetch] ${method} ${url.toString()} 請求失敗`,
        errorData
      );
      return { success: false, error: errorData };
    }

    // 解析回應
    const data = await response.json();
    console.log(`[crosFetch] ${method} ${url.toString()} 請求成功`, {
      status: response.status,
      data,
    });

    return { success: true, data: data as T };
  } catch (error: any) {
    console.error(`[crosFetch] ${method} ${url.toString()} 請求失敗`, error);

    let errorMessage = "";

    // API Error
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = String(error);
    }

    return { success: false, error: { code: 500, message: errorMessage } };
  }
};
