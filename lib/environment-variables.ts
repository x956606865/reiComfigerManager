/**
 * Common environment variables and their descriptions
 */

export interface EnvironmentVariableInfo {
  name: string
  description: string
  example?: string
  category: 'system' | 'shell' | 'development' | 'custom'
}

export const commonEnvironmentVariables: EnvironmentVariableInfo[] = [
  // System variables
  {
    name: 'PATH',
    description: 'Directories where the system looks for executable files',
    example: '/usr/local/bin:/usr/bin:/bin',
    category: 'system'
  },
  {
    name: 'HOME',
    description: 'Path to the current user\'s home directory',
    example: '/Users/username',
    category: 'system'
  },
  {
    name: 'USER',
    description: 'Current username',
    example: 'johndoe',
    category: 'system'
  },
  {
    name: 'LANG',
    description: 'System language and locale settings',
    example: 'en_US.UTF-8',
    category: 'system'
  },
  {
    name: 'PWD',
    description: 'Current working directory',
    example: '/Users/username/projects',
    category: 'system'
  },
  {
    name: 'TMPDIR',
    description: 'Directory for temporary files',
    example: '/tmp',
    category: 'system'
  },
  
  // Shell variables
  {
    name: 'SHELL',
    description: 'Path to the current shell',
    example: '/bin/zsh',
    category: 'shell'
  },
  {
    name: 'TERM',
    description: 'Terminal type',
    example: 'xterm-256color',
    category: 'shell'
  },
  {
    name: 'EDITOR',
    description: 'Default text editor',
    example: 'vim',
    category: 'shell'
  },
  {
    name: 'VISUAL',
    description: 'Default visual editor',
    example: 'code',
    category: 'shell'
  },
  {
    name: 'HISTSIZE',
    description: 'Number of commands to keep in memory',
    example: '10000',
    category: 'shell'
  },
  {
    name: 'SAVEHIST',
    description: 'Number of commands to save to history file',
    example: '10000',
    category: 'shell'
  },
  {
    name: 'HISTFILE',
    description: 'Path to the history file',
    example: '~/.zsh_history',
    category: 'shell'
  },
  {
    name: 'PS1',
    description: 'Primary shell prompt string',
    example: '%n@%m %~ %# ',
    category: 'shell'
  },
  
  // Development variables
  {
    name: 'NODE_ENV',
    description: 'Node.js environment (development, production, test)',
    example: 'development',
    category: 'development'
  },
  {
    name: 'JAVA_HOME',
    description: 'Java installation directory',
    example: '/Library/Java/JavaVirtualMachines/jdk-11.jdk/Contents/Home',
    category: 'development'
  },
  {
    name: 'PYTHON_HOME',
    description: 'Python installation directory',
    example: '/usr/local/opt/python@3.9',
    category: 'development'
  },
  {
    name: 'GOPATH',
    description: 'Go workspace directory',
    example: '~/go',
    category: 'development'
  },
  {
    name: 'GOROOT',
    description: 'Go installation directory',
    example: '/usr/local/go',
    category: 'development'
  },
  {
    name: 'CARGO_HOME',
    description: 'Cargo (Rust) home directory',
    example: '~/.cargo',
    category: 'development'
  },
  {
    name: 'RUSTUP_HOME',
    description: 'Rustup home directory',
    example: '~/.rustup',
    category: 'development'
  },
  {
    name: 'NVM_DIR',
    description: 'Node Version Manager directory',
    example: '~/.nvm',
    category: 'development'
  },
  {
    name: 'ANDROID_HOME',
    description: 'Android SDK directory',
    example: '~/Library/Android/sdk',
    category: 'development'
  },
  {
    name: 'DOCKER_HOST',
    description: 'Docker daemon socket',
    example: 'unix:///var/run/docker.sock',
    category: 'development'
  },
  
  // Common custom variables
  {
    name: 'DOTFILES',
    description: 'Path to dotfiles directory',
    example: '~/dotfiles',
    category: 'custom'
  },
  {
    name: 'PROJECTS',
    description: 'Path to projects directory',
    example: '~/projects',
    category: 'custom'
  }
]

export function getVariableInfo(name: string): EnvironmentVariableInfo | undefined {
  return commonEnvironmentVariables.find(v => v.name === name)
}

export function getVariablesByCategory(category: EnvironmentVariableInfo['category']): EnvironmentVariableInfo[] {
  return commonEnvironmentVariables.filter(v => v.category === category)
}

export function searchVariables(query: string): EnvironmentVariableInfo[] {
  const lowerQuery = query.toLowerCase()
  return commonEnvironmentVariables.filter(v => 
    v.name.toLowerCase().includes(lowerQuery) ||
    v.description.toLowerCase().includes(lowerQuery)
  )
}