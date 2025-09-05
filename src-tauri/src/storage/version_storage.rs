use anyhow::{Context, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use uuid::Uuid;
use tauri::Manager;

use crate::software::ConfigVersion;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionMetadata {
    pub id: String,
    pub software_id: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub note: Option<String>,
    pub is_auto_save: bool,
    pub checksum: String,
    pub file_name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionIndex {
    pub versions: Vec<VersionMetadata>,
    pub max_versions: usize,
}

impl Default for VersionIndex {
    fn default() -> Self {
        Self {
            versions: Vec::new(),
            max_versions: 20, // Default to keeping 20 versions
        }
    }
}

pub struct VersionStorage {
    base_path: PathBuf,
}

impl VersionStorage {
    // Initialize storage with app handle
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self> {
        let app_dir = app_handle
            .path()
            .app_data_dir()
            .context("Failed to get app data directory")?;
        
        let base_path = app_dir.join("versions");
        
        // Ensure directory exists
        fs::create_dir_all(&base_path)?;
        
        Ok(Self { base_path })
    }
    
    // Get storage path for a software
    fn get_software_path(&self, software_id: &str) -> PathBuf {
        self.base_path.join(software_id)
    }
    
    // Get index file path
    fn get_index_path(&self, software_id: &str) -> PathBuf {
        self.get_software_path(software_id).join("index.json")
    }
    
    // Load version index
    fn load_index(&self, software_id: &str) -> Result<VersionIndex> {
        let index_path = self.get_index_path(software_id);
        
        if index_path.exists() {
            let content = fs::read_to_string(&index_path)?;
            Ok(serde_json::from_str(&content)?)
        } else {
            Ok(VersionIndex::default())
        }
    }
    
    // Save version index
    fn save_index(&self, software_id: &str, index: &VersionIndex) -> Result<()> {
        let software_path = self.get_software_path(software_id);
        fs::create_dir_all(&software_path)?;
        
        let index_path = self.get_index_path(software_id);
        let content = serde_json::to_string_pretty(index)?;
        fs::write(index_path, content)?;
        
        Ok(())
    }
    
    // Save a new version
    pub fn save_version(
        &self,
        software_id: &str,
        content: &str,
        parsed_content: Option<serde_json::Value>,
        note: Option<String>,
        is_auto_save: bool,
    ) -> Result<ConfigVersion> {
        let mut index = self.load_index(software_id)?;
        
        let id = Uuid::new_v4().to_string();
        let timestamp = Utc::now();
        let checksum = Self::calculate_checksum(content);
        
        // Check if content has changed
        if let Some(last) = index.versions.last() {
            if last.checksum == checksum && is_auto_save {
                // Content hasn't changed, don't save
                return Ok(ConfigVersion {
                    id: last.id.clone(),
                    software_id: software_id.to_string(),
                    content: content.to_string(),
                    parsed_content,
                    timestamp: last.timestamp,
                    note: last.note.clone(),
                    is_auto_save: last.is_auto_save,
                    checksum: Some(last.checksum.clone()),
                });
            }
        }
        
        // Create file name
        let file_name = format!("{}.json", id);
        let file_path = self.get_software_path(software_id).join(&file_name);
        
        // Save version content
        let version_data = serde_json::json!({
            "content": content,
            "parsed_content": parsed_content,
        });
        
        fs::create_dir_all(file_path.parent().unwrap())?;
        fs::write(&file_path, serde_json::to_string_pretty(&version_data)?)?;
        
        // Add to index
        let metadata = VersionMetadata {
            id: id.clone(),
            software_id: software_id.to_string(),
            timestamp,
            note: note.clone(),
            is_auto_save,
            checksum: checksum.clone(),
            file_name,
        };
        
        index.versions.push(metadata);
        
        // Clean up old versions if needed
        if is_auto_save {
            self.cleanup_old_versions(&mut index, software_id)?;
        }
        
        // Save updated index
        self.save_index(software_id, &index)?;
        
        Ok(ConfigVersion {
            id,
            software_id: software_id.to_string(),
            content: content.to_string(),
            parsed_content,
            timestamp,
            note,
            is_auto_save,
            checksum: Some(checksum),
        })
    }
    
    // Get version history
    pub fn get_history(
        &self,
        software_id: &str,
        limit: Option<usize>,
    ) -> Result<Vec<ConfigVersion>> {
        let index = self.load_index(software_id)?;
        
        let mut versions = Vec::new();
        let start = if let Some(limit) = limit {
            index.versions.len().saturating_sub(limit)
        } else {
            0
        };
        
        for metadata in index.versions.iter().skip(start).rev() {
            let version = self.load_version(software_id, &metadata.id)?;
            versions.push(version);
        }
        
        Ok(versions)
    }
    
    // Get a specific version
    pub fn get_version(&self, software_id: &str, version_id: &str) -> Result<ConfigVersion> {
        self.load_version(software_id, version_id)
    }
    
    // Load version from file
    fn load_version(&self, software_id: &str, version_id: &str) -> Result<ConfigVersion> {
        let index = self.load_index(software_id)?;
        
        let metadata = index.versions
            .iter()
            .find(|v| v.id == version_id)
            .context("Version not found")?;
        
        let file_path = self.get_software_path(software_id).join(&metadata.file_name);
        let content = fs::read_to_string(&file_path)?;
        let version_data: serde_json::Value = serde_json::from_str(&content)?;
        
        Ok(ConfigVersion {
            id: metadata.id.clone(),
            software_id: metadata.software_id.clone(),
            content: version_data["content"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            parsed_content: version_data.get("parsed_content").cloned(),
            timestamp: metadata.timestamp,
            note: metadata.note.clone(),
            is_auto_save: metadata.is_auto_save,
            checksum: Some(metadata.checksum.clone()),
        })
    }
    
    // Delete a version
    pub fn delete_version(&self, software_id: &str, version_id: &str) -> Result<()> {
        let mut index = self.load_index(software_id)?;
        
        if let Some(pos) = index.versions.iter().position(|v| v.id == version_id) {
            let metadata = &index.versions[pos];
            let file_path = self.get_software_path(software_id).join(&metadata.file_name);
            
            // Delete file
            if file_path.exists() {
                fs::remove_file(file_path)?;
            }
            
            // Remove from index
            index.versions.remove(pos);
            self.save_index(software_id, &index)?;
        }
        
        Ok(())
    }
    
    // Set maximum versions to keep
    pub fn set_max_versions(&self, software_id: &str, max_versions: usize) -> Result<()> {
        let mut index = self.load_index(software_id)?;
        index.max_versions = max_versions;
        
        // Clean up if needed
        self.cleanup_old_versions(&mut index, software_id)?;
        self.save_index(software_id, &index)?;
        
        Ok(())
    }
    
    // Get maximum versions setting
    pub fn get_max_versions(&self, software_id: &str) -> Result<usize> {
        let index = self.load_index(software_id)?;
        Ok(index.max_versions)
    }
    
    // Clean up old versions
    fn cleanup_old_versions(&self, index: &mut VersionIndex, software_id: &str) -> Result<()> {
        // Keep only auto-save versions under the limit
        let auto_save_versions: Vec<_> = index.versions
            .iter()
            .filter(|v| v.is_auto_save)
            .collect();
        
        if auto_save_versions.len() > index.max_versions {
            let to_remove = auto_save_versions.len() - index.max_versions;
            
            for version in auto_save_versions.iter().take(to_remove) {
                // Delete file
                let file_path = self.get_software_path(software_id).join(&version.file_name);
                if file_path.exists() {
                    fs::remove_file(file_path)?;
                }
            }
            
            // Remove from index (keep manual saves and recent auto-saves)
            let mut kept_versions = Vec::new();
            let mut auto_save_count = 0;
            
            for version in index.versions.iter().rev() {
                if !version.is_auto_save {
                    kept_versions.push(version.clone());
                } else if auto_save_count < index.max_versions {
                    kept_versions.push(version.clone());
                    auto_save_count += 1;
                }
            }
            
            kept_versions.reverse();
            index.versions = kept_versions;
        }
        
        Ok(())
    }
    
    // Calculate checksum
    fn calculate_checksum(content: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let mut hasher = DefaultHasher::new();
        content.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }
}