import type { ApiReturnData } from "@/types/ApiInteraction";
import type { CreateTimeEntryPayload } from "@/types/Redmine"; // Reuse Create payload or define Update payload if different? Usually similar but partial.
import crosFetch from "@/utils/crosFetch";

/*
Redmine Update Time Entry:
PUT /time_entries/[id].json
{
  "time_entry": {
    "hours": ...
    "activity_id": ...
    "comments": ...
  }
}
*/

export default async (
  id: number,
  payload: Partial<CreateTimeEntryPayload>,
): Promise<ApiReturnData<null>> => {
  return await crosFetch<null>({
    path: `/time_entries/${id}.json`,
    method: "PUT",
    body: payload,
  });
};
