use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Software category types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SoftwareCategory {
    Shell,
    Editor,
    Terminal,
    Vcs,
    PackageManager,
    Tools,
}

// Configuration format types
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ConfigFormat {
    Plain,
    Json,
    Yaml,
    Toml,
    Ini,
    Custom,
}

// Field types for configuration items
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FieldType {
    String,
    Number,
    Boolean,
    Select,
    Multiselect,
    Color,
    Font,
    Keymap,
    Path,
    Code,
    Array,
    Object,
}

// Validation rule for configuration fields
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationRule {
    #[serde(rename = "type")]
    pub rule_type: String,
    pub value: Option<serde_json::Value>,
    pub message: String,
}

// Option for select/multiselect fields
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SelectOption {
    pub label: String,
    pub value: serde_json::Value,
    pub description: Option<String>,
}

// Configuration field definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigField {
    pub key: String,
    pub label: String,
    #[serde(rename = "type")]
    pub field_type: FieldType,
    pub default_value: Option<serde_json::Value>,
    pub placeholder: Option<String>,
    pub options: Option<Vec<SelectOption>>,
    pub validation: Option<Vec<ValidationRule>>,
    pub description: Option<String>,
    pub advanced: Option<bool>,
    pub depends_on: Option<FieldDependency>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldDependency {
    pub field: String,
    pub value: serde_json::Value,
}

// Configuration section
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigSection {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub fields: Vec<ConfigField>,
    pub collapsible: Option<bool>,
    pub default_expanded: Option<bool>,
}

// Configuration schema
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigSchema {
    pub sections: Vec<ConfigSection>,
}

// Template for software configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigTemplate {
    pub id: String,
    pub name: String,
    pub description: String,
    pub author: Option<String>,
    pub tags: Option<Vec<String>>,
    pub content: serde_json::Value,
    pub preview: Option<String>,
}

// Software definition
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareDefinition {
    pub id: String,
    pub name: String,
    pub display_name: String,
    pub icon: String,
    pub category: SoftwareCategory,
    pub description: String,
    pub config_paths: HashMap<String, Vec<String>>,
    pub format: ConfigFormat,
    pub schema: ConfigSchema,
    pub templates: Option<Vec<ConfigTemplate>>,
    pub documentation: Option<String>,
    pub detect_command: Option<String>,
}

// Configuration version
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConfigVersion {
    pub id: String,
    pub software_id: String,
    pub content: String,
    pub parsed_content: Option<serde_json::Value>,
    #[serde(rename = "created_at")]
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub note: Option<String>,
    pub is_auto_save: bool,
    pub checksum: Option<String>,
}

// Software status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoftwareStatus {
    pub id: String,
    pub installed: bool,
    pub config_exists: bool,
    pub config_path: Option<String>,
    pub version: Option<String>,
    pub last_modified: Option<chrono::DateTime<chrono::Utc>>,
}

impl SoftwareDefinition {
    // Get config path for current platform
    pub fn get_config_path(&self) -> Option<Vec<String>> {
        let platform = if cfg!(target_os = "macos") {
            "darwin"
        } else if cfg!(target_os = "linux") {
            "linux"
        } else if cfg!(target_os = "windows") {
            "win32"
        } else {
            return None;
        };
        
        self.config_paths.get(platform).cloned()
    }
    
    // Expand path with home directory
    pub fn expand_path(path: &str) -> String {
        if path.starts_with("~/") {
            if let Ok(home) = std::env::var("HOME") {
                return path.replacen("~", &home, 1);
            }
        }
        path.to_string()
    }
}