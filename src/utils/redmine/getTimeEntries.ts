import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineTimeEntry } from "@/types/Redmine";
import crosFetch from "@/utils/crosFetch";

/** 取得工時列表 (自動處理分頁) */
type GetTimeEntriesReturnData = {
  /** 工時列表 */
  time_entries: RedmineTimeEntry[];
  /** 總數 */
  total_count: number;
};

/** 取得工時列表 (自動處理分頁) */
export default async (
  params: Record<string, string | number> = {},
  signal?: AbortSignal
): Promise<ApiReturnData<GetTimeEntriesReturnData>> => {
  // 如果有指定 limit，則不進行自動分頁
  if (params.limit) {
    const result = await crosFetch<GetTimeEntriesReturnData>({
      path: "/time_entries.json",
      params,
      signal,
    });
    return result;
  }

  const limit = 100;
  let offset = 0;
  let allTimeEntries: RedmineTimeEntry[] = [];
  let totalCount = 0;

  while (true) {
    const result = await crosFetch<GetTimeEntriesReturnData>({
      path: "/time_entries.json",
      params: { ...params, limit, offset },
      signal,
    });

    if (!result.success) {
      return result;
    }

    const { time_entries, total_count } = result.data;
    allTimeEntries = allTimeEntries.concat(time_entries);
    totalCount = total_count;

    if (offset + time_entries.length >= total_count) {
      break;
    }

    offset += limit;
  }

  return {
    success: true,
    data: { time_entries: allTimeEntries, total_count: totalCount },
  };
};
