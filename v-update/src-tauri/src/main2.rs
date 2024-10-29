#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, UpdaterEvent};

#[tauri::command]
async fn check_update(app_handle: tauri::AppHandle) -> Result<String, String> {
    match app_handle.updater().check().await {
        Ok(update) => {
            if update.is_update_available() {
                Ok(update.version().unwrap_or("Unknown version".to_string()))
            } else {
                Ok("현재 최신 버전입니다.".to_string())
            }
        },
        Err(e) => Err(e.to_string()),
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();

            // 업데이트 이벤트 리스너
            app_handle.listen_global("tauri://update-status", move |msg| {
                println!("새로운 업데이트 상태: {:?}", msg);
            });

            app_handle.listen_global("tauri://update-available", move |msg| {
                println!("업데이트 가능: {:?}", msg);
            });

            Ok(())
        })
        .updater() // Updater 플러그인 초기화
        .invoke_handler(tauri::generate_handler![check_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
