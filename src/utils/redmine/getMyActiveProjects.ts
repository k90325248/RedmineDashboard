import _ from "lodash";
import getAllActiveProjects from "./getAllActiveProjects";
import getUsersCurrent from "./getUsersCurrent";

/** 取得使用者參與且啟用中的專案 */
export default async () => {
  try {
    // 1. 取得使用者參與的專案
    const memberships = await getUsersCurrent({
      params: { include: "memberships" },
    });

    // 2. 取得所有啟用中的專案
    const projectsRes = await getAllActiveProjects(undefined);

    if (
      !memberships.success ||
      !memberships.data.memberships ||
      !projectsRes.success ||
      !projectsRes.data.projects
    ) {
      return { success: false, error: "取得參與中專案失敗" };
    }

    // 3. 取交集：(我的會員專案) ∩ (所有啟用中專案), 所以需要跟 active projects 做交集
    const activeProjectIds = projectsRes.data.projects.map((p) => p.id);
    const myProjectIds = memberships.data.memberships.map((m) => m.project.id);
    const intersection = _.intersection(myProjectIds, activeProjectIds);

    return {
      success: true,
      data: projectsRes.data.projects.filter((p) =>
        intersection.includes(p.id),
      ),
    };
  } catch (error) {
    console.error("[ProjectCount] 取得參與中專案失敗", error);
    return { success: false, error };
  }
};
