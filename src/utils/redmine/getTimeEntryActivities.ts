import type { ApiReturnData } from "@/types/ApiInteraction";
import type { RedmineTimeEntryActivity } from "@/types/Redmine";
import crosFetch from "@/utils/crosFetch";

type GetTimeEntryActivitiesReturnData = {
  time_entry_activities: RedmineTimeEntryActivity[];
};

export default async (): Promise<
  ApiReturnData<GetTimeEntryActivitiesReturnData>
> => {
  return await crosFetch<GetTimeEntryActivitiesReturnData>({
    path: "/enumerations/time_entry_activities.json",
    method: "GET",
  });
};
