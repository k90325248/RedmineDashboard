import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineProject } from "@/types/Redmine";

import getProjects from "@/utils/redmine/getProjects";

/** 取得所有啟用中的專案列表 (自動處理分頁) */
type GetProjectsReturnData = {
  /** 專案列表 */
  projects: RedmineProject[];
  /** 總數 */
  total_count: number;
};

/** 取得所有啟用中的專案列表 (自動處理分頁) */
export default async (
  params: Record<string, string | number> = {}
): Promise<ApiReturnData<GetProjectsReturnData>> => {
  // 如果有指定 limit，則不進行自動分頁
  if (params.limit) {
    const result = await getProjects(params);

    if (result.success) {
      // Client-side Filter: 只保留 status === 1 (Active)
      result.data.projects = result.data.projects.filter((p) => p.status === 1);
      // 注意: 單頁查詢時，我們無法得知"真正的" total active count，
      // 這裡暫時維持 API 回傳的 total_count (或者也可以改成 filtered length，視需求而定)
      // 但為了邏輯一致性，我們將 total_count 也更新為 filtered length
      result.data.total_count = result.data.projects.length;
    }

    return result;
  }

  const limit = 100;
  let offset = 0;
  let allProjects: RedmineProject[] = [];

  while (true) {
    const result = await getProjects({ ...params, limit, offset });

    if (!result.success) {
      return result;
    }

    const { projects, total_count } = result.data;
    allProjects = allProjects.concat(projects);

    if (offset + projects.length >= total_count) {
      break;
    }

    offset += limit;
  }

  // Client-side Filter: 只保留 status === 1 (Active)
  const activeProjects = allProjects.filter((p) => p.status === 1);

  return {
    success: true,
    data: { projects: activeProjects, total_count: activeProjects.length },
  };
};
