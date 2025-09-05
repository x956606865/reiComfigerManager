use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::software::ConfigVersion;
use crate::storage::VersionStorage;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionManager;

impl VersionManager {
    // Save a new version
    pub fn save_version(
        storage: &VersionStorage,
        software_id: &str,
        content: &str,
        parsed_content: Option<serde_json::Value>,
        note: Option<String>,
        is_auto_save: bool,
    ) -> Result<ConfigVersion> {
        storage.save_version(software_id, content, parsed_content, note, is_auto_save)
    }
    
    // Get version history for a software
    pub fn get_history(
        storage: &VersionStorage,
        software_id: &str,
        limit: Option<usize>,
    ) -> Result<Vec<ConfigVersion>> {
        storage.get_history(software_id, limit)
    }
    
    // Get a specific version
    pub fn get_version(
        storage: &VersionStorage,
        software_id: &str,
        version_id: &str,
    ) -> Result<ConfigVersion> {
        storage.get_version(software_id, version_id)
    }
    
    // Delete a version
    pub fn delete_version(
        storage: &VersionStorage,
        software_id: &str,
        version_id: &str,
    ) -> Result<()> {
        storage.delete_version(software_id, version_id)
    }
    
    // Set maximum versions to keep
    pub fn set_max_versions(
        storage: &VersionStorage,
        software_id: &str,
        max_versions: usize,
    ) -> Result<()> {
        storage.set_max_versions(software_id, max_versions)
    }
    
    // Get maximum versions setting
    pub fn get_max_versions(
        storage: &VersionStorage,
        software_id: &str,
    ) -> Result<usize> {
        storage.get_max_versions(software_id)
    }
}