#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

#[tauri::command]
async fn check_update(app_handle: tauri::AppHandle) -> Result<String, String> {
    let updater = app_handle.updater();
    match updater.check().await {
        Ok(update) => {
            if update.available {
                match updater.download_and_install().await {
                    Ok(_) => {
                        app_handle.restart();
                        Ok("업데이트가 설치되었습니다. 앱을 재시작합니다.".to_string())
                    }
                    Err(e) => Err(format!("업데이트 설치 중 오류: {}", e))
                }
            } else {
                Ok("현재 최신 버전입니다.".to_string())
            }
        }
        Err(e) => Err(format!("업데이트 확인 중 오류: {}", e))
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![check_update])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}