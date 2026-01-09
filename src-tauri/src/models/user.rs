use serde::{Deserialize, Serialize};

/// 使用者資料結構 (對應 TypeScript 前端的 UserData)
#[derive(Debug, Serialize, Deserialize)]
pub struct UserData {
    /// 使用者 ID
    pub id: i64,
    /// 登入帳號
    pub login: String,
    /// 名字
    pub firstname: String,
    /// 姓氏 (或員工編號)
    pub lastname: String,
}

/// Redmine API 回傳的使用者回應結構
#[derive(Debug, Serialize, Deserialize)]
pub struct UserResponse {
    /// 包含使用者詳細資訊的物件
    pub user: RedmineUserObj,
}

/// Redmine API 使用者物件詳情
#[derive(Debug, Serialize, Deserialize)]
pub struct RedmineUserObj {
    pub id: i64,
    pub login: String,
    pub firstname: String,
    pub lastname: String,
    pub created_on: String,
    /// 上次登入時間 (可能為 None)
    pub last_login_on: Option<String>,
    /// API Key (僅在以帳號密碼登入或 API 回傳包含時存在)
    pub api_key: Option<String>,
    /// 使用者所屬專案 (需透過 include=memberships 取得)
    pub memberships: Option<Vec<Membership>>,
}

/// Redmine 會員資格物件
#[derive(Debug, Serialize, Deserialize)]
pub struct Membership {
    pub id: i64,
    pub project: crate::models::redmine::NameId,
    // 其他欄位如 roles 我們暫時不需要
}

/// API 錯誤資訊結構
#[derive(Debug, Serialize)]
pub struct ApiErrorData {
    /// 錯誤標題
    pub title: String,
    /// 錯誤詳細描述 (可選)
    pub description: Option<String>,
}

/// 登入結果結構 (統一回傳給前端的格式)
#[derive(Debug, Serialize)]
pub struct LoginResult {
    /// 是否成功
    pub success: bool,
    /// 成功時的資料 (包含使用者資訊與加密後的 API Key)
    pub data: Option<LoginSuccessData>,
    /// 失敗時的錯誤資訊
    pub error: Option<ApiErrorData>,
}

/// 登入成功資料結構
#[derive(Debug, Serialize)]
pub struct LoginSuccessData {
    /// 使用者基本資料
    pub user_data: UserData,
    /// 加密後的 API Key (供前端儲存，後續請求使用)
    pub api_key: String,
}
