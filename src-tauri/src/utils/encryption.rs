use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm,
    Nonce, // 這裡使用 Aes256Gcm，也可以根據需求改為 Aes128Gcm
};
use base64::{engine::general_purpose, Engine as _};
use rand::RngCore;

// 在正式的生產環境應用程式中，這個金鑰應該要安全地管理 (例如使用 OS Keychain)。
// 在這個本地端應用程式的情境下，我們使用一個靜態金鑰來允許跨工作階段的可逆加密。
// 這樣做是為了讓後端總是能夠解密前端回傳的 API Key。
// 警告：對於防止二進制檔案被逆向工程來說，這並不是絕對安全的做法。
const API_KEY_SECRET: &[u8; 32] = b"my-tauri-redmine-secret-key-32b!";

/// 加密 API Key
///
/// 使用 AES-256-GCM 演算法加密傳入的 API Key 字串。
/// 回傳 Base64 編碼的加密字串 (包含 Nonce)。
pub fn encrypt_api_key(api_key: &str) -> Result<String, String> {
    // 初始化加密器
    let cipher = Aes256Gcm::new(API_KEY_SECRET.into());
    // 產生隨機的 Nonce (12 bytes)
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    // 執行加密
    let ciphertext = cipher
        .encrypt(nonce, api_key.as_bytes())
        .map_err(|e| format!("加密失敗: {}", e))?;

    // 將 Nonce 和密文結合以便儲存/傳輸 (Nonce 需要用於解密)
    let mut combined = nonce_bytes.to_vec();
    combined.extend(ciphertext);

    // 回傳 Base64 編碼字串
    Ok(general_purpose::STANDARD.encode(combined))
}

/// 解密 API Key
///
/// 對傳入的 Base64 編碼加密字串進行解密，還原為原始 API Key。
pub fn decrypt_api_key(encrypted_base64: &str) -> Result<String, String> {
    // Base64 解碼
    let encrypted_bytes = general_purpose::STANDARD
        .decode(encrypted_base64)
        .map_err(|e| format!("Base64 解碼失敗: {}", e))?;

    // 檢查長度是否足夠包含 Nonce (12 bytes)
    if encrypted_bytes.len() < 12 {
        return Err("無效的加密資料長度".to_string());
    }

    // 分離 Nonce 和密文
    let (nonce_bytes, ciphertext) = encrypted_bytes.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    let cipher = Aes256Gcm::new(API_KEY_SECRET.into());

    // 執行解密
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("解密失敗: {}", e))?;

    // 將解密後的 bytes 轉回 String
    String::from_utf8(plaintext).map_err(|e| format!("UTF-8 解析錯誤: {}", e))
}
