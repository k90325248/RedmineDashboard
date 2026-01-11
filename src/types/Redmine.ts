export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description: string;
  status: number; // 1: Active, 5: Closed, 9: Archived
  is_public: boolean;
  created_on: string;
  updated_on: string;
}

export interface RedmineMembership {
  id: number;
  project: {
    id: number;
    name: string;
  };
  roles: {
    id: number;
    name: string;
  }[];
}

export interface RedmineUser {
  id: number;
  login: string;
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
  last_login_on: string;
  api_key?: string;
  memberships?: RedmineMembership[];
}

export interface RedmineIssue {
  id: number;
  project: {
    id: number;
    name: string;
  };
  tracker: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  author: {
    id: number;
    name: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  subject: string;
  description: string;
  start_date: string;
  due_date?: string;
  done_ratio: number;
  created_on: string;
  updated_on: string;
  closed_on?: string;
}

export interface RedmineTimeEntry {
  id: number;
  project: {
    id: number;
    name: string;
  };
  issue?: {
    id: number;
  };
  user: {
    id: number;
    name: string;
  };
  activity: {
    id: number;
    name: string;
  };
  hours: number;
  comments: string;
  spent_on: string;
  created_on: string;
  updated_on: string;
}
