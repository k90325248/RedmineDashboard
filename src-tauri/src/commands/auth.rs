use crate::api::redmine;
use crate::models::user::LoginResult;

/// Redmine 登入指令 (Tauri Command)
///
/// 支援 API Key 登入與帳號密碼登入 (兩者擇一)。
///
/// # 參數
/// * `host` - Redmine 主機網址
/// * `username` - (可選) 使用者帳號
/// * `password` - (可選) 使用者密碼
/// * `api_key` - (可選) API Key
#[tauri::command]
pub async fn redmine_login(
    host: String,
    username: Option<String>,
    password: Option<String>,
    api_key: Option<String>,
    state: tauri::State<'_, reqwest::blocking::Client>,
) -> Result<LoginResult, String> {
    let client = state.inner().clone();

    // 判斷登入方式
    if let Some(key) = api_key {
        // [API Key 登入]
        // 使用 spawn_blocking 因為 reqwest::blocking 是同步的，避免阻塞非同步 runtime
        let host_clone = host.clone();
        let key_clone = key.clone();

        let result = tauri::async_runtime::spawn_blocking(move || {
            redmine::login_with_api_key(&host_clone, &key_clone, &client)
        })
        .await
        .map_err(|e| format!("任務執行錯誤: {}", e))?;

        return result;
    } else if let (Some(u), Some(p)) = (username, password) {
        // [帳號密碼 登入]
        let host_clone = host.clone();
        let u_clone = u.clone();
        let p_clone = p.clone();

        let result = tauri::async_runtime::spawn_blocking(move || {
            redmine::login_with_credentials(&host_clone, &u_clone, &p_clone, &client)
        })
        .await
        .map_err(|e| format!("任務執行錯誤: {}", e))?;

        return result;
    }

    // 若未提供足夠參數
    Ok(LoginResult {
        success: false,
        data: None,
        error: Some(crate::models::user::ApiErrorData {
            title: "參數錯誤".into(),
            description: Some("必須提供 API Key 或 帳號/密碼".into()),
        }),
    })
}

/// 還原 Redmine 工作階段指令 (Tauri Command)
///
/// 使用加密的 API Key (通常儲存在 LocalStorage) 來恢復登入狀態。
///
/// # 參數
/// * `host` - Redmine 主機網址
/// * `encrypted_api_key` - 加密後的 API Key
#[tauri::command]
pub async fn redmine_restore_session(
    host: String,
    encrypted_api_key: String,
    state: tauri::State<'_, reqwest::blocking::Client>,
) -> Result<LoginResult, String> {
    let client = state.inner().clone();

    // 1. 解密 API Key
    let api_key = match crate::utils::encryption::decrypt_api_key(&encrypted_api_key) {
        Ok(k) => k,
        Err(e) => {
            return Ok(LoginResult {
                success: false,
                data: None,
                error: Some(crate::models::user::ApiErrorData {
                    title: "解密失敗".into(),
                    description: Some(format!("無法解密儲存的金鑰: {}", e)),
                }),
            })
        }
    };

    // 2. 使用解密後的 Key 驗證身分 (呼叫 login_with_api_key)
    // 這裡我們直接呼叫 `login_with_api_key`，它會負責驗證並再次加密回傳 (保持一致性)
    let host_clone = host.clone();
    let key_clone = api_key.clone();

    let result = tauri::async_runtime::spawn_blocking(move || {
        redmine::login_with_api_key(&host_clone, &key_clone, &client)
    })
    .await
    .map_err(|e| format!("任務執行錯誤: {}", e))?;

    result
}
