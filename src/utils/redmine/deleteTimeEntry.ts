import type { ApiReturnData } from "@/types/ApiInteraction";
import crosFetch from "@/utils/crosFetch";

export default async (id: number): Promise<ApiReturnData<null>> => {
  return await crosFetch<null>({
    path: `/time_entries/${id}.json`,
    method: "DELETE",
  });
};
