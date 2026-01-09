pub mod api;
pub mod commands;
pub mod models;
pub mod utils;

// 關於 Tauri Command 的更多資訊請參考 https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 建立共用的 HTTP Client，啟用 Keep-Alive。
    // 使用 std::time::Duration 設定超時。
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .expect("無法建立 HTTP Client");

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(client) // 將 Client 註冊為 State
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::auth::redmine_login,
            commands::auth::redmine_restore_session,
            commands::dashboard::dashboard_get_project_count,
            commands::dashboard::dashboard_get_open_issue_count,
            commands::dashboard::dashboard_get_overdue_issue_count,
            commands::dashboard::dashboard_get_weekly_hours,
            commands::dashboard::dashboard_get_open_issue_diff
        ])
        .run(tauri::generate_context!())
        .expect("執行 Tauri 應用程式時發生錯誤");
}
