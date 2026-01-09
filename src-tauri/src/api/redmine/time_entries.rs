use chrono::Datelike;
use reqwest::blocking::Client;

/// 取得使用者本週累計工時 (API)
///
/// 呼叫 `/time_entries.json` API，篩選條件為：
/// - `user_id=me`: 我的工時
/// - `spent_on=><start_date|end_date`: 日期介於本週一至本週日
pub fn fetch_user_weekly_hours(host: &str, api_key: &str, client: &Client) -> Result<f32, String> {
    // spent_on between current week start and end
    // For simplicity, let's filter by user_id=me and date range
    // Redmine API for time_entries supports spent_on=><start|end
    // We need to calculate start of week (Monday) and End of week (Sunday)
    let now = chrono::Local::now();
    let weekday = now.weekday().num_days_from_monday();
    let start_of_week = now - chrono::Duration::days(weekday as i64);
    let end_of_week = start_of_week + chrono::Duration::days(6);

    let start_date = start_of_week.format("%Y-%m-%d").to_string();
    let end_date = end_of_week.format("%Y-%m-%d").to_string();

    let url = format!(
        "{}/time_entries.json?user_id=me&spent_on=><{}|{}&limit=100",
        host.trim_end_matches('/'),
        start_date,
        end_date
    );

    let response = client
        .get(&url)
        .header("X-Redmine-API-Key", api_key)
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    let raw_text = response
        .text()
        .map_err(|e| format!("無法讀取回應內容: {}", e))?;

    let data: crate::models::redmine::TimeEntryListResponse =
        serde_json::from_str(&raw_text).map_err(|e| format!("無法解析工時列表 JSON: {}", e))?;

    let total_hours: f32 = data.time_entries.iter().map(|e| e.hours).sum();

    Ok(total_hours)
}
