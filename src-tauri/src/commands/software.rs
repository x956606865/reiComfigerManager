use anyhow::Result;
use serde_json::Value;
use tauri::State;

use crate::software::{
    ConfigManager, SoftwareDefinition, SoftwareDetector, SoftwareStatus
};
use crate::storage::{VersionStorage, PreferencesStorage, SoftwarePreferences};
use crate::version::VersionManager;

// Get list of all supported software with their status
#[tauri::command]
pub async fn get_software_list() -> Result<Vec<(SoftwareDefinition, SoftwareStatus)>, String> {
    // In a real implementation, this would load from a configuration file or database
    // For now, we'll create some sample definitions
    let definitions = get_software_definitions();
    
    let mut result = Vec::new();
    for def in definitions {
        let status = SoftwareDetector::get_status(&def);
        result.push((def, status));
    }
    
    Ok(result)
}

// Get software by ID
#[tauri::command]
pub async fn get_software_by_id(id: String) -> Result<Option<SoftwareDefinition>, String> {
    let definitions = get_software_definitions();
    Ok(definitions.into_iter().find(|d| d.id == id))
}

// Get software configuration
#[tauri::command]
pub async fn get_software_config(
    software_id: String,
) -> Result<Option<(String, Value)>, String> {
    let definitions = get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == software_id)
        .ok_or_else(|| format!("Software {} not found", software_id))?;
    
    match ConfigManager::read_config(&software) {
        Ok((content, parsed)) => Ok(Some((content, parsed))),
        Err(e) => {
            // Check if it's just a missing file (not an error)
            if e.to_string().contains("not found") {
                Ok(None)
            } else {
                Err(e.to_string())
            }
        }
    }
}

// Save software configuration
#[tauri::command]
pub async fn save_software_config(
    software_id: String,
    content: String,
    parsed_content: Value,
    note: Option<String>,
    storage: State<'_, VersionStorage>,
) -> Result<(), String> {
    let definitions = get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == software_id)
        .ok_or_else(|| format!("Software {} not found", software_id))?;
    
    // Write configuration file
    ConfigManager::write_config(&software, &parsed_content)
        .map_err(|e| e.to_string())?;
    
    // Save version to storage
    VersionManager::save_version(
        &storage,
        &software_id,
        &content,
        Some(parsed_content),
        note,
        false, // Manual save, not auto-save
    )
    .map_err(|e| e.to_string())?;
    
    Ok(())
}

// Check if software is installed
#[tauri::command]
pub async fn check_software_installed(software_id: String) -> Result<bool, String> {
    let definitions = get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == software_id)
        .ok_or_else(|| format!("Software {} not found", software_id))?;
    
    Ok(SoftwareDetector::is_installed(&software))
}

// Get software status
#[tauri::command]
pub async fn get_software_status(software_id: String) -> Result<SoftwareStatus, String> {
    let definitions = get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == software_id)
        .ok_or_else(|| format!("Software {} not found", software_id))?;
    
    Ok(SoftwareDetector::get_status(&software))
}

// Apply template to configuration
#[tauri::command]
pub async fn apply_template(
    software_id: String,
    template_id: String,
) -> Result<Value, String> {
    let definitions = get_software_definitions();
    let software = definitions
        .into_iter()
        .find(|d| d.id == software_id)
        .ok_or_else(|| format!("Software {} not found", software_id))?;
    
    // Find template
    let template = software.templates
        .and_then(|templates| {
            templates.into_iter().find(|t| t.id == template_id)
        })
        .ok_or_else(|| format!("Template {} not found", template_id))?;
    
    Ok(template.content)
}

// Get software preferences
#[tauri::command]
pub async fn get_preferences(
    software_id: String,
    storage: State<'_, PreferencesStorage>,
) -> Result<SoftwarePreferences, String> {
    storage.get_preferences(&software_id)
        .map_err(|e| e.to_string())
}

// Save software preferences
#[tauri::command]
pub async fn save_preferences(
    preferences: SoftwarePreferences,
    storage: State<'_, PreferencesStorage>,
) -> Result<(), String> {
    storage.save_preferences(preferences)
        .map_err(|e| e.to_string())
}

// Helper function to get software definitions
// In a real app, this would load from a file or embedded resource
pub fn get_software_definitions() -> Vec<SoftwareDefinition> {
    use crate::software::{
        ConfigSchema, ConfigSection, ConfigField, FieldType,
        SoftwareCategory, ConfigFormat
    };
    use std::collections::HashMap;
    
    vec![
        // Example: Zsh configuration
        SoftwareDefinition {
            id: "zsh".to_string(),
            name: "zsh".to_string(),
            display_name: "Zsh".to_string(),
            icon: "terminal".to_string(),
            category: SoftwareCategory::Shell,
            description: "Z shell configuration".to_string(),
            config_paths: {
                let mut paths = HashMap::new();
                paths.insert("darwin".to_string(), vec!["~/.zshrc".to_string()]);
                paths.insert("linux".to_string(), vec!["~/.zshrc".to_string()]);
                paths
            },
            format: ConfigFormat::Plain,
            schema: ConfigSchema {
                sections: vec![
                    ConfigSection {
                        id: "basic".to_string(),
                        title: "Basic Settings".to_string(),
                        description: Some("Core Zsh configuration".to_string()),
                        fields: vec![
                            ConfigField {
                                key: "theme".to_string(),
                                label: "Theme".to_string(),
                                field_type: FieldType::String,
                                default_value: Some(serde_json::json!("robbyrussell")),
                                placeholder: None,
                                options: None,
                                validation: None,
                                description: Some("Oh My Zsh theme".to_string()),
                                advanced: Some(false),
                                depends_on: None,
                            }
                        ],
                        collapsible: Some(false),
                        default_expanded: Some(true),
                    }
                ]
            },
            templates: None,
            documentation: None,
            detect_command: Some("which zsh".to_string()),
        },
        // Add more software definitions here...
    ]
}