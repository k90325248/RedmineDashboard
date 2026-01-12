import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineProject } from "@/types/Redmine";

import crosFetch from "@/utils/crosFetch";

/** 取得專案列表 (自動處理分頁) */
type GetProjectsReturnData = {
  /** 專案列表 */
  projects: RedmineProject[];
  /** 總數 */
  total_count: number;
};

/** 取得專案列表 (自動處理分頁) */
export default async (
  params: Record<string, string | number> = {}
): Promise<ApiReturnData<GetProjectsReturnData>> => {
  // 如果有指定 limit，則不進行自動分頁
  if (params.limit) {
    const result = await crosFetch<GetProjectsReturnData>({
      path: "/projects.json",
      params,
    });
    return result;
  }

  const limit = 100;
  let offset = 0;
  let allProjects: RedmineProject[] = [];
  let totalCount = 0;

  while (true) {
    const result = await crosFetch<GetProjectsReturnData>({
      path: "/projects.json",
      params: { ...params, limit, offset },
    });

    if (!result.success) {
      return result;
    }

    const { projects, total_count } = result.data;
    allProjects = allProjects.concat(projects);
    totalCount = total_count;

    if (offset + projects.length >= total_count) {
      break;
    }

    offset += limit;
  }

  return {
    success: true,
    data: { projects: allProjects, total_count: totalCount },
  };
};
