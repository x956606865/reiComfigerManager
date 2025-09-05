import { invoke } from '@tauri-apps/api/core';

export interface PathCheckResult {
  original: string;
  expanded: string;
  exists: boolean;
  is_directory: boolean;
  is_file: boolean;
  is_symlink: boolean;
  readable: boolean;
  writable: boolean;
}

// Cache management
class PathCheckCache {
  private cache = new Map<string, { result: PathCheckResult; timestamp: number }>();
  private ttl = 5000; // 5 seconds cache

  get(path: string): PathCheckResult | undefined {
    const entry = this.cache.get(path);
    if (entry) {
      // Check if expired
      const age = Date.now() - entry.timestamp;
      if (age > this.ttl) {
        this.cache.delete(path);
        return undefined;
      }
      return entry.result;
    }
    return undefined;
  }

  set(path: string, result: PathCheckResult): void {
    this.cache.set(path, {
      result,
      timestamp: Date.now(),
    });
  }

  clear(): void {
    this.cache.clear();
  }

  clearPath(path: string): void {
    this.cache.delete(path);
  }
}

const cache = new PathCheckCache();

// Check a single path
export async function checkPathExists(path: string): Promise<PathCheckResult> {
  // Check cache first
  const cached = cache.get(path);
  if (cached) {
    return cached;
  }

  try {
    const result = await invoke<PathCheckResult>('check_path_exists', { path });
    cache.set(path, result);
    return result;
  } catch (error) {
    console.error('Failed to check path:', error);
    // Return a default result if backend call fails
    return {
      original: path,
      expanded: path,
      exists: false,
      is_directory: false,
      is_file: false,
      is_symlink: false,
      readable: false,
      writable: false,
    };
  }
}

// Check multiple paths in batch
export async function checkPathsBatch(paths: string[]): Promise<PathCheckResult[]> {
  // Check cache for all paths first
  const uncachedPaths: string[] = [];
  const results: Map<string, PathCheckResult> = new Map();

  for (const path of paths) {
    const cached = cache.get(path);
    if (cached) {
      results.set(path, cached);
    } else {
      uncachedPaths.push(path);
    }
  }

  // Fetch uncached paths from backend
  if (uncachedPaths.length > 0) {
    try {
      const batchResults = await invoke<PathCheckResult[]>('check_paths_batch', { 
        paths: uncachedPaths 
      });
      
      // Update cache and results
      for (const result of batchResults) {
        cache.set(result.original, result);
        results.set(result.original, result);
      }
    } catch (error) {
      console.error('Failed to batch check paths:', error);
      // Add default results for failed paths
      for (const path of uncachedPaths) {
        const defaultResult: PathCheckResult = {
          original: path,
          expanded: path,
          exists: false,
          is_directory: false,
          is_file: false,
          is_symlink: false,
          readable: false,
          writable: false,
        };
        results.set(path, defaultResult);
      }
    }
  }

  // Return results in the same order as input
  return paths.map(path => results.get(path)!);
}

// Detect operating system
function getOS(): 'windows' | 'macos' | 'linux' {
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = navigator.platform.toLowerCase();
  
  if (platform.includes('win') || userAgent.includes('windows')) {
    return 'windows';
  }
  if (platform.includes('mac') || userAgent.includes('macintosh')) {
    return 'macos';
  }
  return 'linux';
}

// Quick local check without backend call
export function quickCheckPath(path: string): 'likely' | 'unlikely' | 'unknown' {
  const trimmed = path.trim();
  if (!trimmed) return 'unlikely';
  
  const os = getOS();
  
  if (os === 'windows') {
    // Windows path patterns
    // Drive letter: C:\, D:\
    if (/^[A-Za-z]:[\\/]/.test(trimmed)) return 'likely';
    
    // UNC path: \\server\share
    if (trimmed.startsWith('\\\\')) return 'likely';
    
    // Environment variables: %VAR%
    if (trimmed.includes('%')) {
      const windowsVars = [
        '%USERPROFILE%',
        '%APPDATA%',
        '%LOCALAPPDATA%',
        '%PROGRAMFILES%',
        '%PROGRAMDATA%',
        '%TEMP%',
        '%HOMEPATH%'
      ];
      if (windowsVars.some(v => trimmed.toUpperCase().includes(v))) {
        return 'likely';
      }
      return 'unknown';
    }
  } else {
    // Unix/Mac path patterns
    // Absolute path
    if (trimmed.startsWith('/')) return 'likely';
    
    // Home directory
    if (trimmed.startsWith('~')) return 'likely';
    
    // Environment variables: $VAR or ${VAR}
    if (trimmed.startsWith('$')) {
      const unixVars = ['$HOME', '$USER', '$PATH', '$PWD', '$SHELL', '$TERM'];
      if (unixVars.some(v => trimmed.toUpperCase().startsWith(v))) {
        return 'likely';
      }
      return 'unknown';
    }
  }
  
  // Relative path or unknown format
  return 'unlikely';
}

// Expand path variables locally (for preview)
export function expandPathLocally(path: string): string {
  const os = getOS();
  let expanded = path;
  
  if (os === 'windows') {
    // Common Windows environment variables (for display only)
    const replacements: Record<string, string> = {
      '%USERPROFILE%': 'C:\\Users\\[username]',
      '%APPDATA%': 'C:\\Users\\[username]\\AppData\\Roaming',
      '%LOCALAPPDATA%': 'C:\\Users\\[username]\\AppData\\Local',
      '%PROGRAMFILES%': 'C:\\Program Files',
      '%PROGRAMFILES(X86)%': 'C:\\Program Files (x86)',
      '%PROGRAMDATA%': 'C:\\ProgramData',
      '%TEMP%': 'C:\\Users\\[username]\\AppData\\Local\\Temp',
      '%HOMEPATH%': '\\Users\\[username]',
      '%HOMEDRIVE%': 'C:',
    };
    
    for (const [pattern, replacement] of Object.entries(replacements)) {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      expanded = expanded.replace(regex, replacement);
    }
  } else {
    // Unix/Mac environment variables (for display only)
    expanded = expanded.replace(/^\~/, '/home/[username]');
    expanded = expanded.replace(/\$HOME|\${HOME}/g, '/home/[username]');
    expanded = expanded.replace(/\$USER|\${USER}/g, '[username]');
    expanded = expanded.replace(/\$PWD|\${PWD}/g, '[current-directory]');
  }
  
  return expanded;
}

// Get common path suggestions based on OS
export function getPathSuggestions(): string[] {
  const os = getOS();
  
  if (os === 'windows') {
    return [
      'C:\\Program Files',
      'C:\\Program Files (x86)',
      '%USERPROFILE%\\.config',
      '%APPDATA%',
      '%LOCALAPPDATA%',
      '%PROGRAMFILES%',
      '%TEMP%',
      'C:\\Windows\\System32',
    ];
  } else if (os === 'macos') {
    return [
      '/Applications',
      '/usr/local/bin',
      '/usr/local/opt',
      '~/Library/Application Support',
      '~/.config',
      '$HOME/.local/bin',
      '/opt/homebrew/bin',
      '/System/Library',
    ];
  } else {
    // Linux
    return [
      '/usr/local/bin',
      '/usr/bin',
      '/opt',
      '~/.config',
      '~/.local/bin',
      '$HOME/.local/share',
      '/etc',
      '/var/lib',
    ];
  }
}

// Clear cache for a specific path
export function clearPathCache(path?: string): void {
  if (path) {
    cache.clearPath(path);
  } else {
    cache.clear();
  }
}

// Debounced path check
let debounceTimer: NodeJS.Timeout | null = null;

export function debouncedCheckPath(
  path: string,
  callback: (result: PathCheckResult) => void,
  delay: number = 300
): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(async () => {
    const result = await checkPathExists(path);
    callback(result);
  }, delay);
}