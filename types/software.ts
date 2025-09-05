/**
 * Software configuration type definitions
 */

// Software category types
export type SoftwareCategory = 'shell' | 'editor' | 'terminal' | 'vcs' | 'package_manager' | 'tools'

// Configuration format types
export type ConfigFormat = 'plain' | 'json' | 'yaml' | 'toml' | 'ini' | 'custom'

// Field types for configuration items
export type FieldType = 
  | 'string' 
  | 'number' 
  | 'boolean' 
  | 'select' 
  | 'multiselect'
  | 'color' 
  | 'font' 
  | 'keymap' 
  | 'path' 
  | 'code' 
  | 'array'
  | 'object'

// Validation rule for configuration fields
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  value?: any
  message: string
}

// Option for select/multiselect fields
export interface SelectOption {
  label: string
  value: string | number | boolean
  description?: string
}

// Configuration field definition
export interface ConfigField {
  key: string
  label: string
  type: FieldType
  defaultValue?: any
  placeholder?: string
  options?: SelectOption[]
  validation?: ValidationRule[]
  description?: string
  advanced?: boolean
  dependsOn?: {
    field: string
    value: any
  }
}

// Configuration section
export interface ConfigSection {
  id: string
  title: string
  description?: string
  fields: ConfigField[]
  collapsible?: boolean
  defaultExpanded?: boolean
}

// Configuration schema
export interface ConfigSchema {
  sections: ConfigSection[]
}

// Template for software configuration
export interface ConfigTemplate {
  id: string
  name: string
  description: string
  author?: string
  tags?: string[]
  content: any
  preview?: string
}

// Software definition
export interface SoftwareDefinition {
  id: string
  name: string
  displayName: string
  icon: string
  category: SoftwareCategory
  description: string
  isComplete?: boolean  // Whether the software configuration is fully implemented
  configPaths: {
    [platform: string]: string | string[]
  }
  format: ConfigFormat
  schema: ConfigSchema
  templates?: ConfigTemplate[]
  documentation?: string
  detectCommand?: string // Command to detect if software is installed
}

// Configuration version
export interface ConfigVersion {
  id: string
  softwareId: string
  content: string
  parsedContent?: any
  timestamp: Date
  note?: string
  isAutoSave: boolean
  checksum?: string
}

// Software status
export interface SoftwareStatus {
  id: string
  installed: boolean
  configExists: boolean
  configPath?: string
  version?: string
  lastModified?: Date
}

// Configuration diff
export interface ConfigDiff {
  added: string[]
  removed: string[]
  modified: {
    key: string
    oldValue: any
    newValue: any
  }[]
}

// User preferences for software
export interface SoftwarePreferences {
  softwareId: string
  preferredEditor: 'form' | 'source'
  showAdvanced: boolean
  autoSave: boolean
  autoBackup: boolean
  backupCount: number
}