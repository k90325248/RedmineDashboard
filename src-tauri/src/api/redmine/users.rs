use crate::models::user::{
    ApiErrorData, LoginResult, LoginSuccessData, RedmineUserObj, UserData, UserResponse,
};
use crate::utils::encryption::encrypt_api_key;
use reqwest::blocking::Client;

/// 取得目前使用者資訊
///
/// 使用 API Key 向 Redmine 呼叫 `/users/current.json` API。
pub fn fetch_current_user(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<RedmineUserObj, String> {
    let url = format!(
        "{}/users/current.json?include=memberships",
        host.trim_end_matches('/')
    );

    // 發送 GET 請求，並帶上 X-Redmine-API-Key Header
    let response = client
        .get(&url)
        .header("X-Redmine-API-Key", api_key)
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    // 檢查 HTTP 狀態碼
    if !response.status().is_success() {
        return Err(format!("API 回傳錯誤狀態: {}", response.status()));
    }

    // 解析 JSON 回應
    let user_response: UserResponse = response
        .json()
        .map_err(|e| format!("無法解析回應 JSON: {}", e))?;

    Ok(user_response.user)
}

/// 使用帳號密碼登入
///
/// 透過 Basic Auth 取得使用者資訊，並從回應中提取 API Key 進行加密回傳。
pub fn login_with_credentials(
    host: &str,
    username: &str,
    password: &str,
    client: &Client,
) -> Result<LoginResult, String> {
    let url = format!("{}/users/current.json", host.trim_end_matches('/'));

    // 發送帶有 Basic Auth 的請求
    let response = client
        .get(&url)
        .basic_auth(username, Some(password))
        .send()
        .map_err(|e| format!("請求失敗: {}", e))?;

    // 處理 API 錯誤
    if !response.status().is_success() {
        return Ok(LoginResult {
            success: false,
            data: None,
            error: Some(ApiErrorData {
                title: "登入失敗".into(),
                description: Some(format!("伺服器回傳: {}", response.status())),
            }),
        });
    }

    let user_response: UserResponse = response
        .json()
        .map_err(|e| format!("無法解析回應 JSON: {}", e))?;

    let user = user_response.user;

    // 針對帳號密碼登入，我們需要 API Key。
    let api_key = match user.api_key.clone() {
        Some(k) => k,
        None => {
            return Ok(LoginResult {
                success: false,
                data: None,
                error: Some(ApiErrorData {
                    title: "找不到 API Key".into(),
                    description: Some(
                        "無法從使用者個人資料中取得 API Key。請嘗試使用 API Key 直接登入。".into(),
                    ),
                }),
            })
        }
    };

    // 加密 API Key 以供前端安全儲存
    let encrypted_key = encrypt_api_key(&api_key).map_err(|e| format!("加密錯誤: {}", e))?;

    Ok(LoginResult {
        success: true,
        data: Some(LoginSuccessData {
            user_data: UserData {
                id: user.id,
                login: user.login,
                firstname: user.firstname,
                lastname: user.lastname,
            },
            api_key: encrypted_key,
        }),
        error: None,
    })
}

/// 使用 API Key 登入
///
/// 驗證 API Key 是否有效，並加密回傳。
pub fn login_with_api_key(
    host: &str,
    api_key: &str,
    client: &Client,
) -> Result<LoginResult, String> {
    match fetch_current_user(host, api_key, client) {
        Ok(user) => {
            // 驗證成功，加密 API Key 回傳
            let encrypted_key = encrypt_api_key(api_key).map_err(|e| format!("加密錯誤: {}", e))?;
            Ok(LoginResult {
                success: true,
                data: Some(LoginSuccessData {
                    user_data: UserData {
                        id: user.id,
                        login: user.login,
                        firstname: user.firstname,
                        lastname: user.lastname,
                    },
                    api_key: encrypted_key,
                }),
                error: None,
            })
        }
        Err(e) => Ok(LoginResult {
            success: false,
            data: None,
            error: Some(ApiErrorData {
                title: "登入失敗".into(),
                description: Some(e),
            }),
        }),
    }
}
