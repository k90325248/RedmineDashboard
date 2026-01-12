import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineUser } from "@/types/Redmine";

import crosFetch from "@/utils/crosFetch";

/** 查詢使用者資料參數 */
interface getUsersCurrentParams {
  /** 查詢參數 */
  params?: Record<string, string>;
  /** HTTP Header */
  headers?: Record<string, string>;
}

/** 取得使用者資料 */
export default async ({
  params = {},
  headers = {},
}: getUsersCurrentParams): Promise<ApiReturnData<RedmineUser>> => {
  // 取得使用者資料
  const result = await crosFetch<{ user: RedmineUser }>({
    path: "/users/current.json",
    params,
    headers,
  });

  // 如果失敗
  if (!result.success) {
    return { success: false, error: result.error };
  }

  // 如果成功
  return { success: true, data: result.data.user };
};
