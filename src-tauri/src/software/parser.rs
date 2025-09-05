use anyhow::{Context, Result};
use serde_json::Value;
use std::fs;
use std::path::Path;

use super::definitions::{ConfigFormat, SoftwareDefinition};

// Trait for configuration parsers
pub trait ConfigParser {
    fn parse(&self, content: &str) -> Result<Value>;
    fn serialize(&self, value: &Value) -> Result<String>;
}

// JSON parser
pub struct JsonParser;

impl ConfigParser for JsonParser {
    fn parse(&self, content: &str) -> Result<Value> {
        serde_json::from_str(content).context("Failed to parse JSON")
    }
    
    fn serialize(&self, value: &Value) -> Result<String> {
        serde_json::to_string_pretty(value).context("Failed to serialize JSON")
    }
}

// YAML parser
pub struct YamlParser;

impl ConfigParser for YamlParser {
    fn parse(&self, content: &str) -> Result<Value> {
        let yaml_value: serde_yaml::Value = serde_yaml::from_str(content)
            .context("Failed to parse YAML")?;
        
        // Convert YAML value to JSON value
        let json_str = serde_json::to_string(&yaml_value)?;
        serde_json::from_str(&json_str).context("Failed to convert YAML to JSON")
    }
    
    fn serialize(&self, value: &Value) -> Result<String> {
        let yaml_value: serde_yaml::Value = serde_yaml::from_str(&value.to_string())?;
        serde_yaml::to_string(&yaml_value).context("Failed to serialize YAML")
    }
}

// TOML parser
pub struct TomlParser;

impl ConfigParser for TomlParser {
    fn parse(&self, content: &str) -> Result<Value> {
        let toml_value: toml::Value = toml::from_str(content)
            .context("Failed to parse TOML")?;
        
        // Convert TOML value to JSON value
        let json_str = serde_json::to_string(&toml_value)?;
        serde_json::from_str(&json_str).context("Failed to convert TOML to JSON")
    }
    
    fn serialize(&self, value: &Value) -> Result<String> {
        let toml_value: toml::Value = toml::from_str(&value.to_string())?;
        toml::to_string_pretty(&toml_value).context("Failed to serialize TOML")
    }
}

// INI parser (basic implementation)
pub struct IniParser;

impl ConfigParser for IniParser {
    fn parse(&self, content: &str) -> Result<Value> {
        let mut result = serde_json::Map::new();
        let mut current_section = String::new();
        
        for line in content.lines() {
            let line = line.trim();
            
            // Skip comments and empty lines
            if line.is_empty() || line.starts_with(';') || line.starts_with('#') {
                continue;
            }
            
            // Section header
            if line.starts_with('[') && line.ends_with(']') {
                current_section = line[1..line.len()-1].to_string();
                result.insert(current_section.clone(), Value::Object(serde_json::Map::new()));
                continue;
            }
            
            // Key-value pair
            if let Some(eq_pos) = line.find('=') {
                let key = line[..eq_pos].trim().to_string();
                let value = line[eq_pos+1..].trim().to_string();
                
                if current_section.is_empty() {
                    result.insert(key, Value::String(value));
                } else {
                    if let Some(Value::Object(section)) = result.get_mut(&current_section) {
                        section.insert(key, Value::String(value));
                    }
                }
            }
        }
        
        Ok(Value::Object(result))
    }
    
    fn serialize(&self, value: &Value) -> Result<String> {
        let mut result = String::new();
        
        if let Value::Object(map) = value {
            for (key, val) in map {
                match val {
                    Value::Object(section) => {
                        result.push_str(&format!("[{}]\n", key));
                        for (k, v) in section {
                            if let Value::String(s) = v {
                                result.push_str(&format!("{} = {}\n", k, s));
                            } else {
                                result.push_str(&format!("{} = {}\n", k, v));
                            }
                        }
                        result.push('\n');
                    }
                    Value::String(s) => {
                        result.push_str(&format!("{} = {}\n", key, s));
                    }
                    _ => {
                        result.push_str(&format!("{} = {}\n", key, val));
                    }
                }
            }
        }
        
        Ok(result)
    }
}

// Plain text parser (for shell configs, vim, etc.)
pub struct PlainParser;

impl ConfigParser for PlainParser {
    fn parse(&self, content: &str) -> Result<Value> {
        // For plain text, we'll parse common patterns and create a structured representation
        let mut result = serde_json::Map::new();
        let mut lines = Vec::new();
        
        for line in content.lines() {
            lines.push(Value::String(line.to_string()));
        }
        
        result.insert("content".to_string(), Value::Array(lines));
        Ok(Value::Object(result))
    }
    
    fn serialize(&self, value: &Value) -> Result<String> {
        // Convert structured data back to plain text
        if let Value::Object(map) = value {
            // Handle frontend's format: { content: [lines] }
            if let Some(Value::Array(lines)) = map.get("content") {
                let mut result = String::new();
                for (i, line) in lines.iter().enumerate() {
                    if let Value::String(s) = line {
                        result.push_str(s);
                        // Don't add newline after last line if it's empty
                        if i < lines.len() - 1 || !s.is_empty() {
                            result.push('\n');
                        }
                    }
                }
                return Ok(result);
            }
            
            // Handle raw content: { raw: "..." }
            if let Some(Value::String(raw)) = map.get("raw") {
                return Ok(raw.clone());
            }
        }
        
        // Fallback: if it's a string, return it directly
        if let Value::String(s) = value {
            return Ok(s.clone());
        }
        
        // Last resort: convert to string
        Ok(value.to_string())
    }
}

// Main configuration manager
pub struct ConfigManager;

impl ConfigManager {
    // Get parser for format
    fn get_parser(format: &ConfigFormat) -> Box<dyn ConfigParser> {
        match format {
            ConfigFormat::Json => Box::new(JsonParser),
            ConfigFormat::Yaml => Box::new(YamlParser),
            ConfigFormat::Toml => Box::new(TomlParser),
            ConfigFormat::Ini => Box::new(IniParser),
            ConfigFormat::Plain | ConfigFormat::Custom => Box::new(PlainParser),
        }
    }
    
    // Read configuration file
    pub fn read_config(software: &SoftwareDefinition) -> Result<(String, Value)> {
        let paths = software.get_config_path()
            .context("No config path for current platform")?;
        
        for path in paths {
            let expanded_path = SoftwareDefinition::expand_path(&path);
            let path = Path::new(&expanded_path);
            
            if path.exists() {
                let content = fs::read_to_string(path)
                    .context(format!("Failed to read config file: {:?}", path))?;
                
                let parser = Self::get_parser(&software.format);
                let parsed = parser.parse(&content)?;
                
                return Ok((content, parsed));
            }
        }
        
        Err(anyhow::anyhow!("Configuration file not found"))
    }
    
    // Write configuration file
    pub fn write_config(software: &SoftwareDefinition, value: &Value) -> Result<()> {
        let paths = software.get_config_path()
            .context("No config path for current platform")?;
        
        if paths.is_empty() {
            return Err(anyhow::anyhow!("No config path defined"));
        }
        
        let path = &paths[0];
        let expanded_path = SoftwareDefinition::expand_path(path);
        let path = Path::new(&expanded_path);
        
        // Create parent directories if they don't exist
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        
        let parser = Self::get_parser(&software.format);
        let content = parser.serialize(value)?;
        
        fs::write(path, content)
            .context(format!("Failed to write config file: {:?}", path))?;
        
        Ok(())
    }
    
    // Create backup of configuration
    pub fn backup_config(software: &SoftwareDefinition) -> Result<String> {
        let (content, _) = Self::read_config(software)?;
        
        // Generate backup filename with timestamp
        let timestamp = chrono::Utc::now().format("%Y%m%d_%H%M%S");
        let _backup_name = format!("{}_backup_{}", software.id, timestamp);
        
        // Store backup (in a real app, this would go to storage)
        // For now, we'll just return the content
        Ok(content)
    }
}