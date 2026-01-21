import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineIssue } from "@/types/Redmine";
import crosFetch from "@/utils/crosFetch";

/** 取得議題列表 (自動處理分頁) */
type GetIssuesReturnData = {
  /** 議題列表 */
  issues: RedmineIssue[];
  /** 總數 */
  total_count: number;
};

/** 取得議題列表 (自動處理分頁) */
export default async (
  params: Record<string, string | number> = {},
  signal?: AbortSignal
): Promise<ApiReturnData<GetIssuesReturnData>> => {
  // 如果有指定 limit，則不進行自動分頁
  if (params.limit) {
    const result = await crosFetch<GetIssuesReturnData>({
      path: "/issues.json",
      params,
      signal,
    });
    return result;
  }

  const limit = 100;
  let offset = 0;
  let allIssues: RedmineIssue[] = [];
  let totalCount = 0;

  while (true) {
    const result = await crosFetch<GetIssuesReturnData>({
      path: "/issues.json",
      params: { ...params, limit, offset },
      signal,
    });

    if (!result.success) {
      return result;
    }

    const { issues, total_count } = result.data;
    allIssues = allIssues.concat(issues);
    totalCount = total_count;

    if (offset + issues.length >= total_count) {
      break;
    }

    offset += limit;
  }

  return {
    success: true,
    data: { issues: allIssues, total_count: totalCount },
  };
};
