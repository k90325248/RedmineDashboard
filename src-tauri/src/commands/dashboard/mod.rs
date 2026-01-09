use crate::api::redmine::{
    fetch_issue_net_diff_7d, fetch_user_open_issues_count, fetch_user_overdue_issues_count,
    fetch_user_projects_count, fetch_user_weekly_hours,
};

/// 取得待處理議題的近 7 日淨變化量 (Command)
///
/// 前端呼叫此指令以取得近 7 日的趨勢（新增 - 完成）。
///
/// # 參數
/// - `host`: Redmine 主機位置
/// - `api_key`: 加密過的 API Key
/// - `state`: Tauri State
///
/// # 回傳
/// - `Ok(i32)`: 淨變化量 (正數代表增加，負數代表減少)
/// - `Err(ApiErrorData)`: 錯誤結構
#[command]
pub async fn dashboard_get_open_issue_diff(
    host: String,
    api_key: String,
    state: State<'_, reqwest::blocking::Client>,
) -> Result<i32, ApiErrorData> {
    let client = state.inner().clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let decrypted_key = decrypt_api_key(&api_key).map_err(|e| ApiErrorData {
            title: "金鑰解密失敗".into(),
            description: Some(e),
        })?;

        fetch_issue_net_diff_7d(&host, &decrypted_key, &client).map_err(|e| ApiErrorData {
            title: "取得議題趨勢失敗".into(),
            description: Some(e),
        })
    })
    .await
    .map_err(|e| ApiErrorData {
        title: "執行緒錯誤".into(),
        description: Some(e.to_string()),
    })?;

    result
}
use crate::models::user::ApiErrorData;
use crate::utils::encryption::decrypt_api_key;
use tauri::{command, State};

// 共用的錯誤回傳結構 (雖然這裡可以直接回傳 Result<T, String> 給前端更方便)
// 但為了保持一致性，我們可以定義一個簡單的回傳結構，或者直接用 Result

/// 取得專案數量 (Command)
///
/// 前端呼叫此指令以取得使用者參與的專案總數。
/// 會先解密 API Key，再呼叫 Redmine API。
///
/// # 參數
/// - `host`: Redmine 主機位置
/// - `api_key`: 加密過的 API Key
/// - `state`: Tauri State，包含共用的 HTTP Client
///
/// # 回傳
/// - `Ok(i32)`: 專案總數
/// - `Err(ApiErrorData)`: 錯誤結構，包含標題與描述
#[command]
pub async fn dashboard_get_project_count(
    host: String,
    api_key: String,
    state: State<'_, reqwest::blocking::Client>,
) -> Result<i32, ApiErrorData> {
    // 取得 Client 的 Clone (reqwest::Client 內部是 Arc，Clone 代價很低)
    let client = state.inner().clone();

    // 雖然 decrypt_api_key 是純計算，但為了讓整個 command 都變成 async，這裡直接移動所有權
    // 將耗時操作丟到 blocking thread
    let result = tauri::async_runtime::spawn_blocking(move || {
        let decrypted_key = decrypt_api_key(&api_key).map_err(|e| ApiErrorData {
            title: "金鑰解密失敗".into(),
            description: Some(e),
        })?;

        fetch_user_projects_count(&host, &decrypted_key, &client).map_err(|e| ApiErrorData {
            title: "取得專案列表失敗".into(),
            description: Some(e),
        })
    })
    .await
    .map_err(|e| ApiErrorData {
        title: "執行緒錯誤".into(),
        description: Some(e.to_string()),
    })?;

    result
}

/// 取得待處理議題數量 (Command)
///
/// 前端呼叫此指令以取得使用者待處理的議題總數。
///
/// # 參數
/// - `host`: Redmine 主機位置
/// - `api_key`: 加密過的 API Key
///
/// # 回傳
/// - `Ok(i32)`: 待處理議題總數
/// - `Err(ApiErrorData)`: 錯誤結構
#[command]
pub async fn dashboard_get_open_issue_count(
    host: String,
    api_key: String,
    state: State<'_, reqwest::blocking::Client>,
) -> Result<i32, ApiErrorData> {
    let client = state.inner().clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let decrypted_key = decrypt_api_key(&api_key).map_err(|e| ApiErrorData {
            title: "金鑰解密失敗".into(),
            description: Some(e),
        })?;

        fetch_user_open_issues_count(&host, &decrypted_key, &client).map_err(|e| ApiErrorData {
            title: "取得待處理議題數失敗".into(),
            description: Some(e),
        })
    })
    .await
    .map_err(|e| ApiErrorData {
        title: "執行緒錯誤".into(),
        description: Some(e.to_string()),
    })?;

    result
}

/// 取得逾期任務數量 (Command)
///
/// 前端呼叫此指令以取得使用者逾期的任務總數。
///
/// # 參數
/// - `host`: Redmine 主機位置
/// - `api_key`: 加密過的 API Key
///
/// # 回傳
/// - `Ok(i32)`: 逾期任務總數
/// - `Err(ApiErrorData)`: 錯誤結構
#[command]
pub async fn dashboard_get_overdue_issue_count(
    host: String,
    api_key: String,
    state: State<'_, reqwest::blocking::Client>,
) -> Result<i32, ApiErrorData> {
    let client = state.inner().clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let decrypted_key = decrypt_api_key(&api_key).map_err(|e| ApiErrorData {
            title: "金鑰解密失敗".into(),
            description: Some(e),
        })?;

        fetch_user_overdue_issues_count(&host, &decrypted_key, &client).map_err(|e| ApiErrorData {
            title: "取得逾期任務數失敗".into(),
            description: Some(e),
        })
    })
    .await
    .map_err(|e| ApiErrorData {
        title: "執行緒錯誤".into(),
        description: Some(e.to_string()),
    })?;

    result
}

/// 取得本週累計工時 (Command)
///
/// 前端呼叫此指令以取得使用者本週的總工時。
///
/// # 參數
/// - `host`: Redmine 主機位置
/// - `api_key`: 加密過的 API Key
///
/// # 回傳
/// - `Ok(f32)`: 本週工時總和
/// - `Err(ApiErrorData)`: 錯誤結構
#[command]
pub async fn dashboard_get_weekly_hours(
    host: String,
    api_key: String,
    state: State<'_, reqwest::blocking::Client>,
) -> Result<f32, ApiErrorData> {
    let client = state.inner().clone();
    let result = tauri::async_runtime::spawn_blocking(move || {
        let decrypted_key = decrypt_api_key(&api_key).map_err(|e| ApiErrorData {
            title: "金鑰解密失敗".into(),
            description: Some(e),
        })?;

        fetch_user_weekly_hours(&host, &decrypted_key, &client).map_err(|e| ApiErrorData {
            title: "取得本週工時失敗".into(),
            description: Some(e),
        })
    })
    .await
    .map_err(|e| ApiErrorData {
        title: "執行緒錯誤".into(),
        description: Some(e.to_string()),
    })?;

    result
}
