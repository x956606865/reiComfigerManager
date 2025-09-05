mod commands;
mod software;
mod storage;
mod version;

use storage::{VersionStorage, PreferencesStorage};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      
      // Initialize storage
      let handle = app.handle();
      
      match VersionStorage::new(&handle) {
        Ok(storage) => {
          app.manage(storage);
          log::info!("Version storage initialized successfully");
        }
        Err(e) => {
          log::error!("Failed to initialize version storage: {}", e);
        }
      }
      
      match PreferencesStorage::new(&handle) {
        Ok(storage) => {
          app.manage(storage);
          log::info!("Preferences storage initialized successfully");
        }
        Err(e) => {
          log::error!("Failed to initialize preferences storage: {}", e);
        }
      }
      
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::get_software_list,
      commands::get_software_by_id,
      commands::get_software_config,
      commands::save_software_config,
      commands::check_software_installed,
      commands::get_software_status,
      commands::apply_template,
      commands::get_version_history,
      commands::get_version,
      commands::restore_version,
      commands::delete_version,
      commands::create_backup,
      commands::set_max_versions,
      commands::get_max_versions,
      commands::get_preferences,
      commands::save_preferences,
      commands::read_config,
      commands::save_config,
      commands::config_exists,
      commands::check_path_exists,
      commands::check_paths_batch,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
