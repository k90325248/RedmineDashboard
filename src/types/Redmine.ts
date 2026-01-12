/** 自訂欄位 */
export interface RedmineCustomField {
  /** ID */
  id: number;
  /** 欄位名稱 */
  name: string;
  /** 欄位值 */
  value: string;
}

/** 專案 */
export interface RedmineProject {
  /** ID */
  id: number;
  /** 專案名稱 */
  name: string;
  /** 專案代號 */
  identifier: string;
  /** 專案描述 */
  description: string;
  /** 專案狀態 (1: 起用, 5: 關閉, 9: 歸檔) */
  status: number;
  /** 是否公開 */
  is_public: boolean;
  /** 自訂欄位 */
  custom_fields: RedmineCustomField[];
  /** 建立時間 */
  created_on: string;
  /** 更新時間 */
  updated_on: string;
}

/** 議題 */
export interface RedmineIssue {
  /** ID */
  id: number;
  /** 專案 */
  project: {
    id: number;
    name: string;
  };
  /** 跟蹤器 */
  tracker: {
    id: number;
    name: string;
  };
  /** 狀態 */
  status: {
    id: number;
    name: string;
  };
  /** 優先等級 */
  priority: {
    id: number;
    name: string;
  };
  /** 作者 */
  author: {
    id: number;
    name: string;
  };
  /** 指派 */
  assigned_to?: {
    id: number;
    name: string;
  };
  /** 主題 */
  subject: string;
  /** 說明 */
  description: string;
  /** 開始日期 */
  start_date: string;
  /** 截止日期 */
  due_date?: string;
  /** 完成比例 */
  done_ratio: number;
  /** 估計時間 */
  estimated_hours?: number;
  /** 自訂欄位 */
  custom_fields: RedmineCustomField[];
  /** 建立時間 */
  created_on: string;
  /** 更新時間 */
  updated_on: string;
  /** 關閉時間 */
  closed_on?: string;
}

/** 工時 */
export interface RedmineTimeEntry {
  /** ID */
  id: number;
  /** 專案 */
  project: {
    id: number;
    name: string;
  };
  /** 議題 */
  issue?: {
    id: number;
  };
  /** 使用者 */
  user: {
    id: number;
    name: string;
  };
  /** 活動 */
  activity: {
    id: number;
    name: string;
  };
  /** 時間 */
  hours: number;
  /** 備註 */
  comments: string;
  /** 花費時間 */
  spent_on: string;
  /** 建立時間 */
  created_on: string;
  /** 更新時間 */
  updated_on: string;
}

/** 使用者資料 */
export interface RedmineUser {
  /** ID */
  id: number;
  /** 帳號 */
  login: string;
  /** 名稱 */
  firstname: string;
  /** 員工編號 */
  lastname: string;
  /** 郵件 */
  mail: string;
  /** 建立時間 */
  created_on: string;
  /** 最後登入時間 */
  last_login_on: string;
  /** API Key */
  api_key: string;
  /** 參與的專案 */
  memberships?: RedmineMembership[];
}

/** 使用者參與的專案 */
export interface RedmineMembership {
  /** ID */
  id: number;
  /** 專案 */
  project: {
    id: number;
    name: string;
  };
  /** 角色 */
  roles: {
    id: number;
    name: string;
  }[];
}
