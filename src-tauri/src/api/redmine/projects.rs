use super::users::fetch_current_user;
use reqwest::blocking::Client;

/// 取得所有啟用中的專案 (分頁讀取)
fn fetch_all_active_projects(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<Vec<crate::models::redmine::Project>, String> {
    let mut all_projects = Vec::new();
    let mut offset = 0;
    let limit = 100;

    loop {
        let url = format!(
            "{}/projects.json?limit={}&offset={}",
            host.trim_end_matches('/'),
            limit,
            offset
        );

        let response = client
            .get(&url)
            .header("X-Redmine-API-Key", api_key)
            .send()
            .map_err(|e| format!("請求失敗 (offset={}): {}", offset, e))?;

        if !response.status().is_success() {
            return Err(format!("API 回傳錯誤狀態: {}", response.status()));
        }

        let data: crate::models::redmine::ProjectListResponse = response
            .json()
            .map_err(|e| format!("無法解析專案列表 JSON: {}", e))?;

        // 檢查是否還有更多資料 (使用原始回傳數量判斷分頁)
        let fetched_count = data.projects.len();

        // Redmine 3.x 似乎會回傳非啟用 (status != 1) 的專案
        // 手動篩選：只保留 status == 1 (Active)
        let active_projects = data.projects.into_iter().filter(|p| p.status == 1);

        all_projects.extend(active_projects);

        // 分頁終止條件：
        // 1. 如果單次抓取數量小於 limit，表示是最後一頁
        // 2. 如果 fetched_count 為 0，表示沒資料了
        if fetched_count < limit as usize || fetched_count == 0 {
            break;
        }

        offset += limit;
    }

    Ok(all_projects)
}

/// 取得使用者參與且啟用中的專案數量 (API)
///
/// 邏輯：
/// 1. 呼叫 `/users/current.json?include=memberships` 取得使用者參與的專案 ID 列表。
/// 2. 呼叫 `/projects.json` (處理分頁) 取得所有啟用中的專案。
/// 3. 取交集：(我的會員專案) ∩ (所有啟用中專案)。
pub fn fetch_user_projects_count(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<i32, String> {
    // 1. 取得使用者資訊 (含 Memberships)
    let user = fetch_current_user(host, api_key, client)?;
    let my_project_ids: std::collections::HashSet<i32> = user
        .memberships
        .unwrap_or_default()
        .iter()
        .map(|m| m.project.id)
        .collect();

    // 2. 取得所有啟用中的專案
    let all_active_projects = fetch_all_active_projects(host, api_key, client)?;

    // 3. 計算交集數量
    //    檢查每一個 active project 是否在 my_project_ids 中
    let count = all_active_projects
        .iter()
        .filter(|p| my_project_ids.contains(&p.id))
        .count();

    Ok(count as i32)
}
