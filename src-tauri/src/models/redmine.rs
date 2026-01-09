use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectListResponse {
    pub projects: Vec<Project>,
    pub total_count: i32,
    pub offset: i32,
    pub limit: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Project {
    pub id: i32,
    pub name: String,
    pub identifier: String,
    pub description: Option<String>,
    pub status: i32,
    pub created_on: String,
    pub updated_on: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IssueListResponse {
    pub issues: Vec<Issue>,
    pub total_count: i32,
    pub offset: i32,
    pub limit: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Issue {
    pub id: i32,
    pub subject: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub due_date: Option<String>,
    pub done_ratio: i32,
    pub created_on: String,
    pub updated_on: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeEntryListResponse {
    pub time_entries: Vec<TimeEntry>,
    pub total_count: i32,
    pub offset: i32,
    pub limit: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TimeEntry {
    pub id: i32,
    pub project: NameId,
    pub issue: Option<IssueId>,
    pub user: NameId,
    pub activity: NameId,
    pub hours: f32,
    pub comments: String,
    pub spent_on: String,
    pub created_on: String,
    pub updated_on: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IssueId {
    pub id: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NameId {
    pub id: i32,
    pub name: String,
}
