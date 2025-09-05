/**
 * Parser for .zshrc configuration files
 */

export interface VariableInfo {
  value: string
  suffix?: string  // Commands after && || or ;
}

export interface ZshConfig {
  environmentVariables: Record<string, VariableInfo | string>
  paths: string[]
  aliases: Record<string, VariableInfo | string>
  otherLines: string[]
}

/**
 * Parse a .zshrc file content into structured data
 */
export function parseZshConfig(content: string): ZshConfig {
  const lines = content.split('\n')
  const config: ZshConfig = {
    environmentVariables: {},
    paths: [],
    aliases: {},
    otherLines: []
  }

  const existingPaths = new Set<string>()

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    // Check if line contains command separators (&&, ||, ;)
    const hasCommandSeparator = /&&|\|\||;/.test(trimmedLine)
    
    // Parse export statements
    // If line contains command separators, only match until the separator
    const exportPattern = hasCommandSeparator 
      ? /^export\s+([A-Z_][A-Z0-9_]*)=((?:[^&|;]|&&|\|\|)+?)(?:\s*(?:&&|\|\||;).*)?$/
      : /^export\s+([A-Z_][A-Z0-9_]*)=(.*)$/
    
    const exportMatch = trimmedLine.match(exportPattern)
    if (exportMatch) {
      const [fullMatch, key, value] = exportMatch
      
      // Extract the actual value, handling quoted strings properly
      let actualValue = value.trim()
      
      // If the value is quoted, extract only the quoted content
      const quotedMatch = actualValue.match(/^(["'])(.*?)\1/)
      if (quotedMatch) {
        actualValue = quotedMatch[0] // Keep the quotes for unquote function
      } else {
        // For unquoted values, stop at command separator
        const separatorMatch = actualValue.match(/(.*?)\s*(?:&&|\|\||;)/)
        if (separatorMatch) {
          actualValue = separatorMatch[1].trim()
        }
      }
      
      const cleanValue = unquote(actualValue)
      
      // Extract the suffix (commands after the variable assignment)
      let suffix: string | undefined
      if (hasCommandSeparator) {
        const suffixMatch = trimmedLine.match(/^export\s+[A-Z_][A-Z0-9_]*=[^&|;]+?(\s*(?:&&|\|\||;).*)$/)
        if (suffixMatch) {
          suffix = suffixMatch[1]
        }
      }
      
      // Special handling for PATH
      if (key === 'PATH') {
        // Parse PATH additions
        const pathValue = cleanValue
        if (pathValue.includes('$PATH')) {
          // Extract new paths being added to PATH
          const parts = pathValue.split('$PATH')
          for (const part of parts) {
            const paths = part.split(':').filter(p => p && p !== '')
            for (const path of paths) {
              if (!existingPaths.has(path)) {
                config.paths.push(path)
                existingPaths.add(path)
              }
            }
          }
        } else {
          // Complete PATH override
          const paths = pathValue.split(':').filter(p => p)
          for (const path of paths) {
            if (!existingPaths.has(path)) {
              config.paths.push(path)
              existingPaths.add(path)
            }
          }
        }
      } else {
        // Store variable with suffix if present
        config.environmentVariables[key] = suffix 
          ? { value: cleanValue, suffix }
          : cleanValue
      }
      continue
    }

    // Parse alias statements
    // Check for command separators in alias lines too
    const aliasHasSeparator = /&&|\|\||;/.test(trimmedLine)
    const aliasPattern = aliasHasSeparator
      ? /^alias\s+([a-zA-Z_][a-zA-Z0-9_]*)=((?:[^&|;]|&&|\|\|)+?)(?:\s*(?:&&|\|\||;).*)?$/
      : /^alias\s+([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$/
    
    const aliasMatch = trimmedLine.match(aliasPattern)
    if (aliasMatch) {
      const [, name, value] = aliasMatch
      
      // Extract the actual value, handling quoted strings
      let actualValue = value.trim()
      const quotedMatch = actualValue.match(/^(["'])(.*?)\1/)
      if (quotedMatch) {
        actualValue = quotedMatch[0]
      } else {
        const separatorMatch = actualValue.match(/(.*?)\s*(?:&&|\|\||;)/)
        if (separatorMatch) {
          actualValue = separatorMatch[1].trim()
        }
      }
      
      // Extract suffix for aliases
      let aliasSuffix: string | undefined
      if (aliasHasSeparator) {
        const suffixMatch = trimmedLine.match(/^alias\s+[a-zA-Z_][a-zA-Z0-9_]*=[^&|;]+?(\s*(?:&&|\|\||;).*)$/)
        if (suffixMatch) {
          aliasSuffix = suffixMatch[1]
        }
      }
      
      // Store alias with suffix if present
      config.aliases[name] = aliasSuffix
        ? { value: unquote(actualValue), suffix: aliasSuffix }
        : unquote(actualValue)
      
      continue
    }

    // Parse PATH additions without export
    const pathMatch = trimmedLine.match(/^PATH=(.*)$/)
    if (pathMatch) {
      const pathValue = unquote(pathMatch[1])
      if (pathValue.includes('$PATH')) {
        const parts = pathValue.split('$PATH')
        for (const part of parts) {
          const paths = part.split(':').filter(p => p && p !== '')
          for (const path of paths) {
            if (!existingPaths.has(path)) {
              config.paths.push(path)
              existingPaths.add(path)
            }
          }
        }
      }
      continue
    }

    // Store other lines
    config.otherLines.push(line)
  }

  return config
}

/**
 * Convert structured config back to .zshrc format
 */
export function stringifyZshConfig(config: ZshConfig): string {
  const lines: string[] = []

  // Add header comment
  lines.push('# Zsh Configuration')
  lines.push('# Generated by Rei Config Manager')
  lines.push('')

  // Environment variables
  if (Object.keys(config.environmentVariables).length > 0) {
    lines.push('# Environment Variables')
    for (const [key, valueOrInfo] of Object.entries(config.environmentVariables)) {
      if (typeof valueOrInfo === 'string') {
        lines.push(`export ${key}="${escapeValue(valueOrInfo)}"`)
      } else {
        // Include suffix if present
        const line = `export ${key}="${escapeValue(valueOrInfo.value)}"${valueOrInfo.suffix || ''}`
        lines.push(line)
      }
    }
    lines.push('')
  }

  // PATH configuration
  if (config.paths.length > 0) {
    lines.push('# PATH Configuration')
    const pathAdditions = config.paths.join(':')
    lines.push(`export PATH="${pathAdditions}:$PATH"`)
    lines.push('')
  }

  // Aliases
  if (Object.keys(config.aliases).length > 0) {
    lines.push('# Aliases')
    for (const [name, commandOrInfo] of Object.entries(config.aliases)) {
      if (typeof commandOrInfo === 'string') {
        lines.push(`alias ${name}="${escapeValue(commandOrInfo)}"`)
      } else {
        // Include suffix if present
        const line = `alias ${name}="${escapeValue(commandOrInfo.value)}"${commandOrInfo.suffix || ''}`
        lines.push(line)
      }
    }
    lines.push('')
  }

  // Other lines
  if (config.otherLines.length > 0) {
    lines.push('# Other Configurations')
    lines.push(...config.otherLines)
  }

  return lines.join('\n')
}

/**
 * Remove quotes from a value
 */
function unquote(value: string): string {
  value = value.trim()
  if ((value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

/**
 * Escape special characters in a value for shell
 */
function escapeValue(value: string): string {
  // Only escape double quotes, not dollar signs
  // Dollar signs are already properly escaped in the input
  return value.replace(/"/g, '\\"')
}