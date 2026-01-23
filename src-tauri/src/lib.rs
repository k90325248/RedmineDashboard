use serde_json::Value;
use std::fs;
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use tauri_plugin_autostart::MacosLauncher;

// 關於 Tauri Command 的更多資訊請參考 https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let tray_menu = Menu::new(app)?;
            let show_i = MenuItem::with_id(app, "show", "顯示", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            tray_menu.append(&show_i)?;
            tray_menu.append(&quit_i)?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&tray_menu)
                .show_menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        match event {
                            TrayIconEvent::Click {
                                button: tauri::tray::MouseButton::Left,
                                ..
                            } => {
                                // 1. 點一下:
                                // a. 視窗在工作列時就讓從工作列打開並到最上層 (Unhide / Unminimize)
                                // b. 視窗不是在最上層時移動到最上層 (Focus)
                                if window.is_visible().unwrap_or(false) {
                                    if window.is_minimized().unwrap_or(false) {
                                        let _ = window.unminimize();
                                    }
                                    let _ = window.set_focus();
                                }
                                // c. 其他情況不動作 (Hidden -> Do nothing)
                            }
                            TrayIconEvent::DoubleClick {
                                button: tauri::tray::MouseButton::Left,
                                ..
                            } => {
                                // 2. 點兩下:
                                // a. 視窗在系統列裡就打開視窗 (Show)
                                if !window.is_visible().unwrap_or(false) {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                } else {
                                    // b. 視窗在工作列時就讓從工作列打開並到最上層
                                    if window.is_minimized().unwrap_or(false) {
                                        let _ = window.unminimize();
                                    }
                                    // c. 視窗不是在最上層時移動到最上層
                                    let _ = window.set_focus();
                                }
                            }
                            _ => {}
                        }
                    }
                })
                .build(app)?;

            // 處理「啟動時縮小」邏輯
            let settings_path = app.path().app_data_dir()?.join("settings.json");
            let mut start_minimized = false;

            if let Ok(content) = fs::read_to_string(&settings_path) {
                if let Ok(json) = serde_json::from_str::<Value>(&content) {
                    if let Some(val) = json.get("start_minimized") {
                        start_minimized = val.as_bool().unwrap_or(false);
                    }
                }
            }

            // 檢查是否為自動啟動 (是否有 --autostart 參數)
            let is_autostart = std::env::args().any(|arg| arg == "--autostart");
            let should_start_minimized = start_minimized && is_autostart;

            if !should_start_minimized {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }

            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--autostart"]),
        ))
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("執行 Tauri 應用程式時發生錯誤");
}
