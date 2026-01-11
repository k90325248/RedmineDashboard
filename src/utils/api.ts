import { fetch } from "@tauri-apps/plugin-http";
import type { ApiReturnData } from "@/types/ApiInteraction";
import type {
  RedmineUser,
  RedmineProject,
  RedmineIssue,
  RedmineTimeEntry,
} from "@/types/Redmine";
import { useUserStore } from "@/stores/user";

class RedmineApi {
  private get host(): string {
    const store = useUserStore();
    return store.host.replace(/\/$/, "");
  }

  private get apiKey(): string {
    const store = useUserStore();
    return store.apiKey;
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, string | number> = {}
  ): Promise<ApiReturnData<T>> {
    const store = useUserStore();
    if (!store.host || !store.apiKey) {
      return {
        success: false,
        error: {
          title: "未設定連線資訊",
          description: "請先登入或設定 Host 與 API Key",
        },
      };
    }

    const url = new URL(`${this.host}${endpoint}`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "X-Redmine-API-Key": this.apiKey,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            title: "API 請求失敗",
            description: `Status: ${response.status} ${response.statusText}`,
          },
        };
      }

      const data = await response.json();
      return { success: true, data: data as T };
    } catch (e) {
      return {
        success: false,
        error: {
          title: "連線錯誤",
          description: e instanceof Error ? e.message : String(e),
        },
      };
    }
  }

  /**
   * 取得當前使用者資訊
   * @param include 額外包含的資訊，例如 'memberships'
   */
  async getCurrentUser(include?: string): Promise<ApiReturnData<RedmineUser>> {
    const params: Record<string, string> = {};
    if (include) params.include = include;
    params.limit = "100"; // Ensure we get up to 100 memberships

    const result = await this.request<{ user: RedmineUser }>(
      "/users/current.json",
      params
    );
    if (result.success && result.data) {
      return { success: true, data: result.data.user };
    }
    return { success: false, error: result.error };
  }

  /**
   * 取得所有啟用中的專案 (自動處理分頁)
   * 為了與 Rust 後端邏輯一致，這裡會:
   * 1. 使用 fetched < limit 作為分頁結束條件
   * 2. 進行 Client-side status 過濾 (以防 API 回傳非 Active 專案)
   */
  async getAllActiveProjects(): Promise<ApiReturnData<RedmineProject[]>> {
    let offset = 0;
    const limit = 100;
    let allProjects: RedmineProject[] = [];

    while (true) {
      // Rust 邏輯未使用 status=1 參數，而是取回後自己過濾。
      // 但為了效能我們保留 status=1，並加上 Client-side double check。
      const result = await this.request<{
        projects: RedmineProject[];
        total_count: number;
      }>("/projects.json", { limit, offset });

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const fetchedProjects = result.data.projects;
      const fetchedCount = fetchedProjects.length;

      // Client-side Filter: 只保留 status === 1 (Active)
      // 對應 Rust: .filter(|p| p.status == 1)
      const activeProjects = fetchedProjects.filter((p) => p.status === 1);
      allProjects = allProjects.concat(activeProjects);

      // 分頁終止條件：本次抓取數量 < limit 或 為 0
      if (fetchedCount < limit || fetchedCount === 0) {
        break;
      }
      offset += limit;
    }

    return { success: true, data: allProjects };
  }

  /**
   * 取得議題列表
   */
  async getIssues(
    query: Record<string, string | number>
  ): Promise<ApiReturnData<{ issues: RedmineIssue[]; total_count: number }>> {
    return this.request<{ issues: RedmineIssue[]; total_count: number }>(
      "/issues.json",
      query
    );
  }

  /**
   * 取得本週工時
   */
  async getWeeklyHours(): Promise<ApiReturnData<number>> {
    const today = new Date();
    const day = today.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const mondayStr = monday.toISOString().split("T")[0];

    // Fetch all entries for this week
    let offset = 0;
    const limit = 100;
    let totalHours = 0;

    while (true) {
      const result = await this.request<{
        time_entries: RedmineTimeEntry[];
        total_count: number;
      }>("/time_entries.json", {
        user_id: "me",
        spent_on: `>=${mondayStr}`,
        limit,
        offset,
      });

      if (!result.success || !result.data) {
        return { success: false, error: result.error };
      }

      const entries = result.data.time_entries;
      totalHours += entries.reduce((acc, entry) => acc + entry.hours, 0);

      if (offset + entries.length >= result.data.total_count) {
        break;
      }
      offset += limit;
    }

    return { success: true, data: totalHours };
  }
}

export const api = new RedmineApi();
