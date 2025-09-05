use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use std::fs;

#[derive(Debug, Serialize, Deserialize)]
pub struct PathCheckResult {
    pub original: String,
    pub expanded: String,
    pub exists: bool,
    pub is_directory: bool,
    pub is_file: bool,
    pub is_symlink: bool,
    pub readable: bool,
    pub writable: bool,
}

#[tauri::command]
pub async fn check_path_exists(path: String) -> Result<PathCheckResult, String> {
    let expanded = expand_path(&path);
    let path_obj = Path::new(&expanded);
    
    let metadata = path_obj.metadata();
    let exists = metadata.is_ok();
    
    let result = PathCheckResult {
        original: path.clone(),
        expanded: expanded.clone(),
        exists,
        is_directory: path_obj.is_dir(),
        is_file: path_obj.is_file(),
        is_symlink: path_obj.is_symlink(),
        readable: check_readable(&path_obj),
        writable: check_writable(&path_obj),
    };
    
    Ok(result)
}

#[tauri::command]
pub async fn check_paths_batch(paths: Vec<String>) -> Result<Vec<PathCheckResult>, String> {
    let mut results = Vec::new();
    
    for path in paths {
        match check_path_exists(path).await {
            Ok(result) => results.push(result),
            Err(_) => continue,
        }
    }
    
    Ok(results)
}

/// Expand environment variables and special symbols in path
fn expand_path(path: &str) -> String {
    let mut expanded = path.to_string();
    
    // Platform-specific expansion
    #[cfg(target_os = "windows")]
    {
        expanded = expand_windows_path(&expanded);
    }
    
    #[cfg(any(target_os = "macos", target_os = "linux"))]
    {
        expanded = expand_unix_path(&expanded);
    }
    
    expanded
}

#[cfg(target_os = "windows")]
fn expand_windows_path(path: &str) -> String {
    use std::env;
    let mut result = path.to_string();
    
    // Handle common Windows environment variables
    let replacements = [
        ("%USERPROFILE%", env::var("USERPROFILE")),
        ("%HOMEPATH%", env::var("HOMEPATH")),
        ("%HOMEDRIVE%", env::var("HOMEDRIVE")),
        ("%APPDATA%", env::var("APPDATA")),
        ("%LOCALAPPDATA%", env::var("LOCALAPPDATA")),
        ("%PROGRAMFILES%", env::var("PROGRAMFILES")),
        ("%PROGRAMFILES(X86)%", env::var("PROGRAMFILES(X86)")),
        ("%PROGRAMDATA%", env::var("PROGRAMDATA")),
        ("%TEMP%", env::var("TEMP")),
        ("%TMP%", env::var("TMP")),
    ];
    
    for (pattern, replacement) in replacements {
        if result.contains(pattern) {
            if let Ok(value) = replacement {
                result = result.replace(pattern, &value);
            }
        }
    }
    
    // Handle generic %VAR% pattern
    if result.contains('%') {
        result = expand_windows_env_vars(&result);
    }
    
    // Normalize path separators
    result = result.replace('/', "\\");
    
    result
}

#[cfg(target_os = "windows")]
fn expand_windows_env_vars(path: &str) -> String {
    use regex::Regex;
    use std::env;
    
    let mut result = path.to_string();
    
    // Match %VARIABLE% pattern
    let re = Regex::new(r"%([^%]+)%").unwrap();
    for cap in re.captures_iter(path) {
        if let Some(var_name) = cap.get(1) {
            if let Ok(value) = env::var(var_name.as_str()) {
                result = result.replace(&cap[0], &value);
            }
        }
    }
    
    result
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn expand_unix_path(path: &str) -> String {
    use std::env;
    let mut result = path.to_string();
    
    // Expand tilde to home directory
    if result.starts_with("~/") || result == "~" {
        if let Ok(home) = env::var("HOME") {
            if result == "~" {
                result = home;
            } else {
                result = result.replacen("~", &home, 1);
            }
        }
    }
    
    // Expand environment variables
    result = expand_unix_env_vars(&result);
    
    result
}

#[cfg(any(target_os = "macos", target_os = "linux"))]
fn expand_unix_env_vars(path: &str) -> String {
    use regex::Regex;
    use std::env;
    
    let mut result = path.to_string();
    
    // Match ${VARIABLE} pattern
    let re_braces = Regex::new(r"\$\{([^}]+)\}").unwrap();
    for cap in re_braces.captures_iter(path) {
        if let Some(var_name) = cap.get(1) {
            if let Ok(value) = env::var(var_name.as_str()) {
                result = result.replace(&cap[0], &value);
            }
        }
    }
    
    // Match $VARIABLE pattern (alphanumeric and underscore)
    let re_dollar = Regex::new(r"\$([A-Za-z_][A-Za-z0-9_]*)").unwrap();
    let temp = result.clone();
    for cap in re_dollar.captures_iter(&temp) {
        if let Some(var_name) = cap.get(1) {
            if let Ok(value) = env::var(var_name.as_str()) {
                result = result.replace(&cap[0], &value);
            }
        }
    }
    
    result
}

fn check_readable(path: &Path) -> bool {
    // Try to read metadata as a simple readability check
    path.metadata().is_ok()
}

fn check_writable(path: &Path) -> bool {
    // For directories, check if we can list contents
    if path.is_dir() {
        return fs::read_dir(path).is_ok();
    }
    
    // For files, check if we can open for writing (without actually writing)
    if path.is_file() {
        use std::fs::OpenOptions;
        return OpenOptions::new()
            .write(true)
            .open(path)
            .is_ok();
    }
    
    // For non-existent paths, check parent directory
    if let Some(parent) = path.parent() {
        if parent.exists() {
            // Check if parent directory is writable
            return check_writable(parent);
        }
    }
    
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_expand_unix_path() {
        #[cfg(any(target_os = "macos", target_os = "linux"))]
        {
            // Test tilde expansion
            let home = std::env::var("HOME").unwrap();
            assert_eq!(expand_unix_path("~"), home);
            assert_eq!(expand_unix_path("~/Documents"), format!("{}/Documents", home));
            
            // Test environment variable expansion
            std::env::set_var("TEST_VAR", "test_value");
            assert_eq!(expand_unix_path("$TEST_VAR/path"), "test_value/path");
            assert_eq!(expand_unix_path("${TEST_VAR}/path"), "test_value/path");
        }
    }

    #[test]
    fn test_expand_windows_path() {
        #[cfg(target_os = "windows")]
        {
            // Test environment variable expansion
            let userprofile = std::env::var("USERPROFILE").unwrap();
            assert_eq!(expand_windows_path("%USERPROFILE%\\Documents"), 
                      format!("{}\\Documents", userprofile));
        }
    }
}