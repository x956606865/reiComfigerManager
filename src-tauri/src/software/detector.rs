use anyhow::Result;
use std::process::Command;
use std::path::Path;

use super::definitions::{SoftwareDefinition, SoftwareStatus};

pub struct SoftwareDetector;

impl SoftwareDetector {
    // Check if software is installed
    pub fn is_installed(software: &SoftwareDefinition) -> bool {
        if let Some(detect_cmd) = &software.detect_command {
            // Try to run detection command
            if let Ok(output) = Command::new("sh")
                .arg("-c")
                .arg(detect_cmd)
                .output()
            {
                return output.status.success();
            }
        }
        
        // Default detection based on software ID
        match software.id.as_str() {
            "zsh" => Self::command_exists("zsh"),
            "bash" => Self::command_exists("bash"),
            "vim" => Self::command_exists("vim"),
            "git" => Self::command_exists("git"),
            "vscode" => Self::command_exists("code"),
            "tmux" => Self::command_exists("tmux"),
            _ => false,
        }
    }
    
    // Check if a command exists in PATH
    fn command_exists(command: &str) -> bool {
        Command::new("which")
            .arg(command)
            .output()
            .map(|output| output.status.success())
            .unwrap_or(false)
    }
    
    // Check if configuration file exists
    pub fn config_exists(software: &SoftwareDefinition) -> (bool, Option<String>) {
        if let Some(paths) = software.get_config_path() {
            for path in paths {
                let expanded_path = SoftwareDefinition::expand_path(&path);
                if Path::new(&expanded_path).exists() {
                    return (true, Some(expanded_path));
                }
            }
        }
        (false, None)
    }
    
    // Get software version
    pub fn get_version(software: &SoftwareDefinition) -> Option<String> {
        let version_cmd = match software.id.as_str() {
            "zsh" => "zsh --version",
            "bash" => "bash --version | head -n1",
            "vim" => "vim --version | head -n1",
            "git" => "git --version",
            "vscode" => "code --version | head -n1",
            "tmux" => "tmux -V",
            _ => return None,
        };
        
        Command::new("sh")
            .arg("-c")
            .arg(version_cmd)
            .output()
            .ok()
            .and_then(|output| {
                if output.status.success() {
                    String::from_utf8(output.stdout)
                        .ok()
                        .map(|s| s.trim().to_string())
                } else {
                    None
                }
            })
    }
    
    // Get complete software status
    pub fn get_status(software: &SoftwareDefinition) -> SoftwareStatus {
        let installed = Self::is_installed(software);
        let (config_exists, config_path) = Self::config_exists(software);
        let version = Self::get_version(software);
        
        let last_modified = if let Some(ref path) = config_path {
            std::fs::metadata(path)
                .ok()
                .and_then(|metadata| metadata.modified().ok())
                .and_then(|time| {
                    // Convert SystemTime to DateTime
                    let duration = time.duration_since(std::time::UNIX_EPOCH).ok()?;
                    Some(chrono::DateTime::from_timestamp(
                        duration.as_secs() as i64,
                        duration.subsec_nanos(),
                    )?)
                })
        } else {
            None
        };
        
        SoftwareStatus {
            id: software.id.clone(),
            installed,
            config_exists,
            config_path,
            version,
            last_modified,
        }
    }
    
    // Detect all installed software
    pub fn detect_all(definitions: &[SoftwareDefinition]) -> Vec<SoftwareStatus> {
        definitions
            .iter()
            .map(|software| Self::get_status(software))
            .collect()
    }
}