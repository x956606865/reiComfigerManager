use std::fs;
use std::path::PathBuf;
use tauri::command;

#[derive(serde::Serialize)]
pub struct ConfigContent {
    content: String,
}

// Expand tilde (~) to home directory
fn expand_tilde(path: &str) -> PathBuf {
    if path.starts_with("~/") {
        if let Some(home) = dirs::home_dir() {
            return home.join(&path[2..]);
        }
    }
    PathBuf::from(path)
}

// Read configuration file
#[command]
pub async fn read_config(software_id: String) -> Result<ConfigContent, String> {
    // For now, we'll hardcode the path for zsh
    // In a full implementation, this would look up the path from software definitions
    let path = match software_id.as_str() {
        "zsh" => expand_tilde("~/.zshrc"),
        _ => return Err(format!("Unsupported software: {}", software_id)),
    };

    match fs::read_to_string(&path) {
        Ok(content) => Ok(ConfigContent { content }),
        Err(err) => {
            // If file doesn't exist, return empty content
            if err.kind() == std::io::ErrorKind::NotFound {
                Ok(ConfigContent { 
                    content: String::new() 
                })
            } else {
                Err(format!("Failed to read config: {}", err))
            }
        }
    }
}

// Save configuration file
#[command]
pub async fn save_config(software_id: String, content: String) -> Result<(), String> {
    // For now, we'll hardcode the path for zsh
    let path = match software_id.as_str() {
        "zsh" => expand_tilde("~/.zshrc"),
        _ => return Err(format!("Unsupported software: {}", software_id)),
    };

    // Create backup before saving
    if path.exists() {
        let backup_path = path.with_extension("zshrc.backup");
        if let Err(err) = fs::copy(&path, &backup_path) {
            eprintln!("Warning: Failed to create backup: {}", err);
        }
    }

    // Save the new content
    match fs::write(&path, content) {
        Ok(_) => Ok(()),
        Err(err) => Err(format!("Failed to save config: {}", err)),
    }
}

// Check if configuration file exists
#[command]
pub async fn config_exists(software_id: String) -> Result<bool, String> {
    let path = match software_id.as_str() {
        "zsh" => expand_tilde("~/.zshrc"),
        _ => return Err(format!("Unsupported software: {}", software_id)),
    };

    Ok(path.exists())
}