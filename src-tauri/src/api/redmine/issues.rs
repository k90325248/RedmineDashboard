use reqwest::blocking::Client;

/// 取得使用者待處理議題數量 (API)
///
/// 呼叫 `/issues.json` API，篩選條件為：
/// - `assigned_to_id=me`: 指派給我的
/// - `status_id=open`: 狀態為開啟
pub fn fetch_user_open_issues_count(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<i32, String> {
    // assigned_to_id=me & status_id=open
    let url = format!(
        "{}/issues.json?assigned_to_id=me&status_id=open&limit=1",
        host.trim_end_matches('/')
    );

    let response = client
        .get(&url)
        .header("X-Redmine-API-Key", api_key)
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("API 回傳錯誤狀態: {}", response.status()));
    }

    let data: crate::models::redmine::IssueListResponse = response
        .json()
        .map_err(|e| format!("無法解析議題列表 JSON: {}", e))?;

    Ok(data.total_count)
}

/// 取得使用者逾期任務數量 (API)
///
/// 呼叫 `/issues.json` API，篩選條件為：
/// - `assigned_to_id=me`: 指派給我的
/// - `status_id=open`: 狀態為開啟
/// - `due_date=<YYYY-MM-DD`: 到期日小於今天 (即逾期)
pub fn fetch_user_overdue_issues_count(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<i32, String> {
    // assigned_to_id=me & status_id=open & due_date=<=today (using due_date=<yyyy-mm-dd)
    // Redmine API supports due_date=<=YYYY-MM-DD
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let url = format!(
        "{}/issues.json?assigned_to_id=me&status_id=open&due_date=<{}&limit=1",
        host.trim_end_matches('/'),
        today
    );

    let response = client
        .get(&url)
        .header("X-Redmine-API-Key", api_key)
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("API 回傳錯誤狀態: {}", response.status()));
    }

    let data: crate::models::redmine::IssueListResponse = response
        .json()
        .map_err(|e| format!("無法解析議題列表 JSON: {}", e))?;

    Ok(data.total_count)
}

/// 取得近 7 日新增且指派給我的議題數量 (API)
fn fetch_recently_created_issues_count(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<i32, String> {
    // created_on >= 7 days ago
    let url = format!(
        "{}/issues.json?assigned_to_id=me&status_id=*&created_on=>=t-7d&limit=1",
        host.trim_end_matches('/')
    );

    let response = client
        .get(&url)
        .header("X-Redmine-API-Key", api_key)
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("API 回傳錯誤狀態: {}", response.status()));
    }

    let data: crate::models::redmine::IssueListResponse = response
        .json()
        .map_err(|e| format!("無法解析議題列表 JSON: {}", e))?;

    Ok(data.total_count)
}

/// 取得近 7 日完成且指派給我的議題數量 (API)
fn fetch_recently_closed_issues_count(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<i32, String> {
    // closed_on >= 7 days ago
    let url = format!(
        "{}/issues.json?assigned_to_id=me&status_id=closed&closed_on=>=t-7d&limit=1",
        host.trim_end_matches('/')
    );

    let response = client
        .get(&url)
        .header("X-Redmine-API-Key", api_key)
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("API 回傳錯誤狀態: {}", response.status()));
    }

    let data: crate::models::redmine::IssueListResponse = response
        .json()
        .map_err(|e| format!("無法解析議題列表 JSON: {}", e))?;

    Ok(data.total_count)
}

/// 計算近 7 日待處理議題的淨變化量 (API)
///
/// 公式：(近 7 日新增) - (近 7 日完成)
/// 這是一個估算值，無法包含「轉單」的情況。
pub fn fetch_issue_net_diff_7d(host: &str, api_key: &str, client: &Client) -> Result<i32, String> {
    let created = fetch_recently_created_issues_count(host, api_key, client)?;
    let closed = fetch_recently_closed_issues_count(host, api_key, client)?;

    Ok(created - closed)
}
