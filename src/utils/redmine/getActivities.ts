import type { ApiReturnData } from "@/types/ApiInteraction";
import crosFetch from "@/utils/crosFetch";

/** 活動項目 */
export interface RedmineActivity {
  id: number;
  project: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  type: string; // e.g., "issue", "issue-note", "time-entry"
  title: string;
  description: string;
  created_on: string;
  url?: string; // Redmine API doesn't always return URL directly in JSON, but we can construct it if needed, or it might be there
}

export default async (
  params: Record<string, string | number> = {},
  signal?: AbortSignal
): Promise<ApiReturnData<any>> => {
  const result = await crosFetch<any>({
    path: `/activity.json`,
    params,
    signal,
  });

  return result;
};
