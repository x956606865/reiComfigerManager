use tauri::State;

use crate::software::ConfigVersion;
use crate::storage::VersionStorage;
use crate::version::VersionManager;

// Get version history for a software
#[tauri::command]
pub async fn get_version_history(
    software_id: String,
    limit: Option<usize>,
    storage: State<'_, VersionStorage>,
) -> Result<Vec<ConfigVersion>, String> {
    VersionManager::get_history(&storage, &software_id, limit)
        .map_err(|e| e.to_string())
}

// Get a specific version
#[tauri::command]
pub async fn get_version(
    software_id: String,
    version_id: String,
    storage: State<'_, VersionStorage>,
) -> Result<ConfigVersion, String> {
    VersionManager::get_version(&storage, &software_id, &version_id)
        .map_err(|e| e.to_string())
}

// Restore a specific version
#[tauri::command]
pub async fn restore_version(
    software_id: String,
    version_id: String,
    storage: State<'_, VersionStorage>,
) -> Result<(), String> {
    // Get the version
    let version = VersionManager::get_version(&storage, &software_id, &version_id)
        .map_err(|e| e.to_string())?;
    
    // Get software definition
    let definitions = crate::commands::software::get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == version.software_id)
        .ok_or_else(|| format!("Software {} not found", version.software_id))?;
    
    // Write the configuration
    if let Some(ref parsed) = version.parsed_content {
        crate::software::ConfigManager::write_config(&software, parsed)
            .map_err(|e| e.to_string())?;
    } else {
        // If no parsed content, write raw content
        // This is a fallback for plain text configs
        let paths = software.get_config_path()
            .ok_or_else(|| "No config path for current platform".to_string())?;
        
        if !paths.is_empty() {
            let path = crate::software::SoftwareDefinition::expand_path(&paths[0]);
            std::fs::write(&path, &version.content)
                .map_err(|e| format!("Failed to write config: {}", e))?;
        }
    }
    
    // Save a new version marking this as a restore
    VersionManager::save_version(
        &storage,
        &version.software_id,
        &version.content,
        version.parsed_content,
        Some(format!("Restored from version {}", version_id)),
        false,
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

// Delete a version
#[tauri::command]
pub async fn delete_version(
    software_id: String,
    version_id: String,
    storage: State<'_, VersionStorage>,
) -> Result<(), String> {
    VersionManager::delete_version(&storage, &software_id, &version_id)
        .map_err(|e| e.to_string())
}

// Set maximum versions to keep
#[tauri::command]
pub async fn set_max_versions(
    software_id: String,
    max_versions: usize,
    storage: State<'_, VersionStorage>,
) -> Result<(), String> {
    VersionManager::set_max_versions(&storage, &software_id, max_versions)
        .map_err(|e| e.to_string())
}

// Get maximum versions setting
#[tauri::command]
pub async fn get_max_versions(
    software_id: String,
    storage: State<'_, VersionStorage>,
) -> Result<usize, String> {
    VersionManager::get_max_versions(&storage, &software_id)
        .map_err(|e| e.to_string())
}

// Create a backup
#[tauri::command]
pub async fn create_backup(
    software_id: String,
    note: Option<String>,
    storage: State<'_, VersionStorage>,
) -> Result<ConfigVersion, String> {
    let definitions = crate::commands::software::get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == software_id)
        .ok_or_else(|| format!("Software {} not found", software_id))?;
    
    // Read current configuration
    let (content, parsed) = crate::software::ConfigManager::read_config(&software)
        .map_err(|e| e.to_string())?;
    
    // Save as backup
    VersionManager::save_version(
        &storage,
        &software_id,
        &content,
        Some(parsed),
        note.or_else(|| Some("Manual backup".to_string())),
        false,
    )
    .map_err(|e| e.to_string())
}

