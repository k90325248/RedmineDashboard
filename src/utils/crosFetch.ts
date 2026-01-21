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
  /** 中斷控制器 */
  signal?: AbortSignal;
};

export default async <T>({
  path,
  method = "GET",
  params = {},
  body,
  headers = {},
  signal,
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
      signal,
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
        errorData,
      );
      return { success: false, error: errorData };
    }

    // 處理 204 No Content
    if (response.status === 204) {
      console.log(
        `[crosFetch] ${method} ${url.toString()} 請求成功 (No Content)`,
      );
      return { success: true, data: null as unknown as T };
    }

    // 解析回應
    const text = await response.text();
    let data = null;

    if (text) {
      data = JSON.parse(text);
    }

    console.log(`[crosFetch] ${method} ${url.toString()} 請求成功`, {
      status: response.status,
      data,
    });

    return { success: true, data: data as T };
  } catch (error: any) {
    if (error === "Request canceled" || error.message === "Request cancelled") {
      console.log("Tauri HTTP 請求已被取消 (使用者離開頁面)");
      return {
        success: false,
        error: { code: 499, message: "Request cancelled" },
        abort: true,
      };
    }

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
