import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineIssue } from "@/types/Redmine";
import crosFetch from "@/utils/crosFetch";

/** 取得單一議題回傳資料 */
type GetIssueReturnData = {
  issue: RedmineIssue;
};

/**
 * 取得單一議題
 * @param id 議題 ID
 * @param params 其他參數 (如 include)
 */
export default async (
  id: number | string,
  params: Record<string, string | number> = {}
): Promise<ApiReturnData<GetIssueReturnData>> => {
  const result = await crosFetch<GetIssueReturnData>({
    path: `/issues/${id}.json`,
    params,
  });

  return result;
};
