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
use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};
use tauri::{State, Window};

// 狀態管理：是否忽略失去焦點事件
struct IgnoreBlur(Arc<AtomicBool>);

// 開始拖曳視窗的指令
#[tauri::command]
fn start_drag(window: Window, state: State<IgnoreBlur>) {
    // 設置忽略失去焦點標記為 true
    state.0.store(true, Ordering::SeqCst);

    // 開始拖曳
    let _ = window.start_dragging();

    // 延遲 500ms 後重置標記
    // 這是為了防止拖曳開始時觸發的瞬間 blur 導致視窗關閉
    let ignore_blur = state.0.clone();
    tauri::async_runtime::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        ignore_blur.store(false, Ordering::SeqCst);
    });
}

// 狀態管理：是否釘選視窗 (不自動隱藏)
struct IsPinned(Arc<AtomicBool>);

// 設定釘選狀態
#[tauri::command]
fn set_pinned(pinned: bool, state: State<IsPinned>) {
    state.0.store(pinned, Ordering::SeqCst);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化共享狀態
    let ignore_blur = Arc::new(AtomicBool::new(false));
    let is_pinned = Arc::new(AtomicBool::new(false));

    tauri::Builder::default()
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("ctrl+shift+q")
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state == tauri_plugin_global_shortcut::ShortcutState::Pressed {
                        if shortcut.matches(
                            tauri_plugin_global_shortcut::Modifiers::SHIFT
                                | tauri_plugin_global_shortcut::Modifiers::CONTROL,
                            tauri_plugin_global_shortcut::Code::KeyQ,
                        ) {
                            if let Some(window) = app.get_webview_window("quick") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    }
                })
                .build(),
        )
        .manage(IgnoreBlur(ignore_blur.clone()))
        .manage(IsPinned(is_pinned.clone()))
        .invoke_handler(tauri::generate_handler![greet, start_drag, set_pinned])
        .setup(move |app| {
            // 監聽 quick 視窗的焦點事件，失去焦點時隱藏
            // 僅在正式版 (Release) 生效，開發模式 (Dev) 方便除錯不隱藏
            // 暫時在 Dev 模式也開啟以測試拖曳修復效果
            if let Some(quick_window) = app.get_webview_window("quick") {
                let quick_window_clone = quick_window.clone();
                let ignore_blur = ignore_blur.clone();
                let is_pinned = is_pinned.clone();
                quick_window.on_window_event(move |event| {
                    if let tauri::WindowEvent::Focused(focused) = event {
                        if !focused {
                            // 如果正在拖曳 (或是剛開始拖曳)，則忽略隱藏
                            let dragging = ignore_blur.load(Ordering::SeqCst);
                            // 如果視窗被釘選，則忽略隱藏
                            let pinned = is_pinned.load(Ordering::SeqCst);

                            if !dragging && !pinned {
                                let _ = quick_window_clone.hide();
                            }
                        }
                    }
                });
            }

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
        .run(tauri::generate_context!())
        .expect("執行 Tauri 應用程式時發生錯誤");
}
