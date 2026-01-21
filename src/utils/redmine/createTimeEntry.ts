import type { ApiReturnData } from "@/types/ApiInteraction";
import type { CreateTimeEntryPayload, RedmineTimeEntry } from "@/types/Redmine";
import crosFetch from "@/utils/crosFetch";

type CreateTimeEntryReturnData = {
  time_entry: RedmineTimeEntry;
};

export default async (
  payload: CreateTimeEntryPayload,
): Promise<ApiReturnData<CreateTimeEntryReturnData>> => {
  return await crosFetch<CreateTimeEntryReturnData>({
    path: "/time_entries.json",
    method: "POST",
    body: payload,
  });
};
