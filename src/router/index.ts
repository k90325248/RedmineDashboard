import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";

// 定義路由配置的型別
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Login",
    component: () => import("../pages/Login.vue"),
    meta: { layout: "login", title: "登入" },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../pages/Dashboard.vue"),
    meta: { requiresAuth: true, title: "總覽" },
  },
  {
    path: "/project-issues",
    name: "ProjectIssues",
    component: () => import("../pages/ProjectIssues.vue"),
    meta: { requiresAuth: true, title: "專案議題" },
  },
  {
    path: "/work-time",
    name: "WorkTime",
    component: () => import("../pages/WorkTime.vue"),
    meta: { requiresAuth: true, title: "工時填寫" },
  },
  {
    path: "/work-time-import",
    name: "WorkTimeImport",
    component: () => import("../pages/WorkTimeImport.vue"),
    meta: { requiresAuth: true, title: "工時匯入" },
  },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore();

  // 嘗試初始化使用者 (若已登入則回傳 true)
  const isLoggedIn = await userStore.initUser();

  // 若路由需要驗證
  if (to.meta.requiresAuth) {
    if (isLoggedIn) {
      next(); // 放行
    } else {
      // 導回登入頁並可能需要提示登入，這裡先單純導回
      next({ name: "Login" });
    }
  }
  // 若路由不需要驗證
  else {
    if (isLoggedIn) {
      next({ name: "Dashboard" });
    } else {
      next();
    }
  }
});

export default router;
