use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwarePreferences {
    pub software_id: String,
    pub preferred_editor: String, // "form" or "source"
    pub show_advanced: bool,
    pub auto_save: bool,
    pub auto_backup: bool,
    pub backup_count: usize,
}

impl Default for SoftwarePreferences {
    fn default() -> Self {
        Self {
            software_id: String::new(),
            preferred_editor: "form".to_string(),
            show_advanced: false,
            auto_save: true,
            auto_backup: true,
            backup_count: 20,
        }
    }
}

pub struct PreferencesStorage {
    file_path: PathBuf,
}

impl PreferencesStorage {
    // Initialize preferences storage
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self> {
        let app_dir = app_handle
            .path()
            .app_data_dir()?;
        
        let file_path = app_dir.join("preferences.json");
        
        // Ensure directory exists
        fs::create_dir_all(&app_dir)?;
        
        Ok(Self { file_path })
    }
    
    // Load all preferences
    fn load_all(&self) -> Result<Vec<SoftwarePreferences>> {
        if self.file_path.exists() {
            let content = fs::read_to_string(&self.file_path)?;
            Ok(serde_json::from_str(&content)?)
        } else {
            Ok(Vec::new())
        }
    }
    
    // Save all preferences
    fn save_all(&self, preferences: &[SoftwarePreferences]) -> Result<()> {
        let content = serde_json::to_string_pretty(preferences)?;
        fs::write(&self.file_path, content)?;
        Ok(())
    }
    
    // Get preferences for a software
    pub fn get_preferences(&self, software_id: &str) -> Result<SoftwarePreferences> {
        let all = self.load_all()?;
        
        Ok(all
            .into_iter()
            .find(|p| p.software_id == software_id)
            .unwrap_or_else(|| SoftwarePreferences {
                software_id: software_id.to_string(),
                ..Default::default()
            }))
    }
    
    // Save preferences for a software
    pub fn save_preferences(&self, preferences: SoftwarePreferences) -> Result<()> {
        let mut all = self.load_all()?;
        
        // Update or add preferences
        if let Some(pos) = all.iter().position(|p| p.software_id == preferences.software_id) {
            all[pos] = preferences;
        } else {
            all.push(preferences);
        }
        
        self.save_all(&all)?;
        Ok(())
    }
}