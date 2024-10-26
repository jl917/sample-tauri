// src-tauri/src/main.rs
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::LogicalPosition;

#[tauri::command]
async fn monitor_window_status(window_label: String, app_handle: tauri::AppHandle) -> bool {
    let window = app_handle.get_window(&window_label);
    match window {
        Some(_) => true,
        None => false,
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![monitor_window_status])
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            // 메인 창을 첫 번째 모니터에 위치시킴
            window.set_position(LogicalPosition::new(0.0, 0.0)).unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}