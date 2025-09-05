/**
 * Predefined software definitions with their configuration schemas
 */

import { SoftwareDefinition } from '@/types/software'

export const softwareDefinitions: SoftwareDefinition[] = [
  // Shell configurations
  {
    id: 'zsh',
    name: 'zsh',
    displayName: 'Zsh',
    icon: 'terminal',
    category: 'shell',
    description: 'Z shell configuration',
    isComplete: true,  // This software is complete and can be edited
    configPaths: {
      darwin: '~/.zshrc',
      linux: '~/.zshrc',
      win32: ''
    },
    format: 'plain',
    schema: {
      sections: [
        {
          id: 'basic',
          title: 'Basic Settings',
          description: 'Core Zsh configuration',
          fields: [
            {
              key: 'theme',
              label: 'Theme',
              type: 'select',
              defaultValue: 'robbyrussell',
              options: [
                { label: 'Robbyrussell', value: 'robbyrussell' },
                { label: 'Agnoster', value: 'agnoster' },
                { label: 'Powerlevel10k', value: 'powerlevel10k' },
                { label: 'Spaceship', value: 'spaceship' },
                { label: 'Pure', value: 'pure' }
              ],
              description: 'Oh My Zsh theme'
            },
            {
              key: 'plugins',
              label: 'Plugins',
              type: 'multiselect',
              defaultValue: ['git'],
              options: [
                { label: 'Git', value: 'git', description: 'Git aliases and functions' },
                { label: 'Docker', value: 'docker', description: 'Docker completion and aliases' },
                { label: 'Node', value: 'node', description: 'Node.js helpers' },
                { label: 'Python', value: 'python', description: 'Python helpers' },
                { label: 'Kubectl', value: 'kubectl', description: 'Kubernetes CLI helpers' },
                { label: 'Z', value: 'z', description: 'Directory jumping' },
                { label: 'Autojump', value: 'autojump', description: 'Fast directory navigation' },
                { label: 'Syntax Highlighting', value: 'zsh-syntax-highlighting' },
                { label: 'Autosuggestions', value: 'zsh-autosuggestions' }
              ],
              description: 'Oh My Zsh plugins to enable'
            },
            {
              key: 'histsize',
              label: 'History Size',
              type: 'number',
              defaultValue: 10000,
              validation: [
                { type: 'min', value: 100, message: 'History size must be at least 100' },
                { type: 'max', value: 1000000, message: 'History size too large' }
              ],
              description: 'Number of commands to keep in history'
            }
          ]
        },
        {
          id: 'aliases',
          title: 'Aliases',
          description: 'Command shortcuts',
          collapsible: true,
          fields: [
            {
              key: 'aliases',
              label: 'Custom Aliases',
              type: 'array',
              defaultValue: [],
              description: 'Define custom command aliases'
            }
          ]
        },
        {
          id: 'environment',
          title: 'Environment Variables',
          description: 'Shell environment configuration',
          collapsible: true,
          fields: [
            {
              key: 'path_additions',
              label: 'PATH Additions',
              type: 'array',
              defaultValue: [],
              description: 'Additional directories to add to PATH'
            },
            {
              key: 'editor',
              label: 'Default Editor',
              type: 'select',
              defaultValue: 'vim',
              options: [
                { label: 'Vim', value: 'vim' },
                { label: 'Neovim', value: 'nvim' },
                { label: 'Emacs', value: 'emacs' },
                { label: 'Nano', value: 'nano' },
                { label: 'VS Code', value: 'code' }
              ]
            }
          ]
        }
      ]
    },
    templates: [
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Basic Zsh configuration',
        content: {
          theme: 'robbyrussell',
          plugins: ['git'],
          histsize: 5000
        }
      },
      {
        id: 'developer',
        name: 'Developer',
        description: 'Full-featured developer setup',
        content: {
          theme: 'powerlevel10k',
          plugins: ['git', 'docker', 'node', 'python', 'z', 'zsh-syntax-highlighting', 'zsh-autosuggestions'],
          histsize: 50000
        }
      }
    ]
  },

  // Vim configuration
  {
    id: 'vim',
    name: 'vim',
    displayName: 'Vim',
    icon: 'file-text',
    category: 'editor',
    description: 'Vim text editor configuration',
    isComplete: false,  // Not yet implemented
    configPaths: {
      darwin: '~/.vimrc',
      linux: '~/.vimrc',
      win32: '~/_vimrc'
    },
    format: 'plain',
    schema: {
      sections: [
        {
          id: 'basic',
          title: 'Basic Settings',
          fields: [
            {
              key: 'number',
              label: 'Show Line Numbers',
              type: 'boolean',
              defaultValue: true,
              description: 'Display line numbers in the editor'
            },
            {
              key: 'relativenumber',
              label: 'Relative Line Numbers',
              type: 'boolean',
              defaultValue: false,
              description: 'Show relative line numbers'
            },
            {
              key: 'tabstop',
              label: 'Tab Width',
              type: 'select',
              defaultValue: 4,
              options: [
                { label: '2 spaces', value: 2 },
                { label: '4 spaces', value: 4 },
                { label: '8 spaces', value: 8 }
              ]
            },
            {
              key: 'expandtab',
              label: 'Expand Tab to Spaces',
              type: 'boolean',
              defaultValue: true,
              description: 'Use spaces instead of tabs'
            },
            {
              key: 'wrap',
              label: 'Line Wrap',
              type: 'boolean',
              defaultValue: false,
              description: 'Wrap long lines'
            },
            {
              key: 'syntax',
              label: 'Syntax Highlighting',
              type: 'boolean',
              defaultValue: true
            }
          ]
        },
        {
          id: 'appearance',
          title: 'Appearance',
          collapsible: true,
          fields: [
            {
              key: 'colorscheme',
              label: 'Color Scheme',
              type: 'select',
              defaultValue: 'default',
              options: [
                { label: 'Default', value: 'default' },
                { label: 'Desert', value: 'desert' },
                { label: 'Slate', value: 'slate' },
                { label: 'Molokai', value: 'molokai' },
                { label: 'Solarized', value: 'solarized' },
                { label: 'Gruvbox', value: 'gruvbox' }
              ]
            },
            {
              key: 'background',
              label: 'Background',
              type: 'select',
              defaultValue: 'dark',
              options: [
                { label: 'Dark', value: 'dark' },
                { label: 'Light', value: 'light' }
              ]
            },
            {
              key: 'cursorline',
              label: 'Highlight Current Line',
              type: 'boolean',
              defaultValue: true
            }
          ]
        },
        {
          id: 'keymaps',
          title: 'Key Mappings',
          collapsible: true,
          fields: [
            {
              key: 'leader',
              label: 'Leader Key',
              type: 'string',
              defaultValue: '\\',
              description: 'The leader key for custom mappings'
            },
            {
              key: 'custom_maps',
              label: 'Custom Mappings',
              type: 'array',
              defaultValue: [],
              description: 'Define custom key mappings'
            }
          ]
        }
      ]
    }
  },

  // Git configuration
  {
    id: 'git',
    name: 'git',
    displayName: 'Git',
    icon: 'git-branch',
    category: 'vcs',
    description: 'Git version control configuration',
    isComplete: false,  // Not yet implemented
    configPaths: {
      darwin: '~/.gitconfig',
      linux: '~/.gitconfig',
      win32: '~/.gitconfig'
    },
    format: 'ini',
    schema: {
      sections: [
        {
          id: 'user',
          title: 'User Information',
          fields: [
            {
              key: 'user.name',
              label: 'Name',
              type: 'string',
              validation: [
                { type: 'required', message: 'Name is required' }
              ],
              description: 'Your name for Git commits'
            },
            {
              key: 'user.email',
              label: 'Email',
              type: 'string',
              validation: [
                { type: 'required', message: 'Email is required' },
                { type: 'pattern', value: '^[^@]+@[^@]+$', message: 'Invalid email format' }
              ],
              description: 'Your email for Git commits'
            },
            {
              key: 'user.signingkey',
              label: 'GPG Signing Key',
              type: 'string',
              advanced: true,
              description: 'GPG key for signing commits'
            }
          ]
        },
        {
          id: 'core',
          title: 'Core Settings',
          fields: [
            {
              key: 'core.editor',
              label: 'Default Editor',
              type: 'select',
              defaultValue: 'vim',
              options: [
                { label: 'Vim', value: 'vim' },
                { label: 'Neovim', value: 'nvim' },
                { label: 'VS Code', value: 'code --wait' },
                { label: 'Nano', value: 'nano' },
                { label: 'Emacs', value: 'emacs' }
              ]
            },
            {
              key: 'core.autocrlf',
              label: 'Line Ending Conversion',
              type: 'select',
              defaultValue: 'input',
              options: [
                { label: 'No conversion', value: 'false' },
                { label: 'Convert to LF on commit', value: 'input' },
                { label: 'Convert to CRLF on checkout', value: 'true' }
              ]
            },
            {
              key: 'core.ignorecase',
              label: 'Ignore Case',
              type: 'boolean',
              defaultValue: false,
              description: 'Ignore case in file names'
            }
          ]
        },
        {
          id: 'color',
          title: 'Color Settings',
          collapsible: true,
          fields: [
            {
              key: 'color.ui',
              label: 'Enable Colors',
              type: 'boolean',
              defaultValue: true,
              description: 'Use colors in Git output'
            },
            {
              key: 'color.branch',
              label: 'Branch Colors',
              type: 'boolean',
              defaultValue: true
            },
            {
              key: 'color.diff',
              label: 'Diff Colors',
              type: 'boolean',
              defaultValue: true
            },
            {
              key: 'color.status',
              label: 'Status Colors',
              type: 'boolean',
              defaultValue: true
            }
          ]
        },
        {
          id: 'alias',
          title: 'Aliases',
          collapsible: true,
          fields: [
            {
              key: 'aliases',
              label: 'Git Aliases',
              type: 'object',
              defaultValue: {
                'co': 'checkout',
                'br': 'branch',
                'ci': 'commit',
                'st': 'status',
                'unstage': 'reset HEAD --',
                'last': 'log -1 HEAD',
                'visual': '!gitk'
              },
              description: 'Custom Git command aliases'
            }
          ]
        }
      ]
    },
    templates: [
      {
        id: 'basic',
        name: 'Basic',
        description: 'Essential Git configuration',
        content: {
          'user.name': '',
          'user.email': '',
          'core.editor': 'vim',
          'color.ui': true
        }
      },
      {
        id: 'advanced',
        name: 'Advanced',
        description: 'Full-featured Git setup with signing',
        content: {
          'user.name': '',
          'user.email': '',
          'user.signingkey': '',
          'commit.gpgsign': true,
          'core.editor': 'nvim',
          'color.ui': true,
          'pull.rebase': true,
          'push.default': 'current'
        }
      }
    ]
  },

  // VS Code configuration
  {
    id: 'vscode',
    name: 'vscode',
    displayName: 'VS Code',
    icon: 'code',
    category: 'editor',
    description: 'Visual Studio Code settings',
    isComplete: false,  // Not yet implemented
    configPaths: {
      darwin: '~/Library/Application Support/Code/User/settings.json',
      linux: '~/.config/Code/User/settings.json',
      win32: '%APPDATA%\\Code\\User\\settings.json'
    },
    format: 'json',
    schema: {
      sections: [
        {
          id: 'editor',
          title: 'Editor Settings',
          fields: [
            {
              key: 'editor.fontSize',
              label: 'Font Size',
              type: 'number',
              defaultValue: 14,
              validation: [
                { type: 'min', value: 8, message: 'Font size too small' },
                { type: 'max', value: 32, message: 'Font size too large' }
              ]
            },
            {
              key: 'editor.fontFamily',
              label: 'Font Family',
              type: 'font',
              defaultValue: 'Menlo, Monaco, "Courier New", monospace'
            },
            {
              key: 'editor.tabSize',
              label: 'Tab Size',
              type: 'select',
              defaultValue: 4,
              options: [
                { label: '2', value: 2 },
                { label: '4', value: 4 },
                { label: '8', value: 8 }
              ]
            },
            {
              key: 'editor.wordWrap',
              label: 'Word Wrap',
              type: 'select',
              defaultValue: 'off',
              options: [
                { label: 'Off', value: 'off' },
                { label: 'On', value: 'on' },
                { label: 'Word Boundary', value: 'wordWrapColumn' },
                { label: 'Bounded', value: 'bounded' }
              ]
            },
            {
              key: 'editor.minimap.enabled',
              label: 'Show Minimap',
              type: 'boolean',
              defaultValue: true
            },
            {
              key: 'editor.lineNumbers',
              label: 'Line Numbers',
              type: 'select',
              defaultValue: 'on',
              options: [
                { label: 'On', value: 'on' },
                { label: 'Off', value: 'off' },
                { label: 'Relative', value: 'relative' }
              ]
            }
          ]
        },
        {
          id: 'workbench',
          title: 'Workbench',
          fields: [
            {
              key: 'workbench.colorTheme',
              label: 'Color Theme',
              type: 'select',
              defaultValue: 'Default Dark+',
              options: [
                { label: 'Default Dark+', value: 'Default Dark+' },
                { label: 'Default Light+', value: 'Default Light+' },
                { label: 'Monokai', value: 'Monokai' },
                { label: 'Solarized Dark', value: 'Solarized Dark' },
                { label: 'Solarized Light', value: 'Solarized Light' }
              ]
            },
            {
              key: 'workbench.iconTheme',
              label: 'Icon Theme',
              type: 'select',
              defaultValue: 'vscode-icons',
              options: [
                { label: 'VS Code Icons', value: 'vscode-icons' },
                { label: 'Material Icon Theme', value: 'material-icon-theme' },
                { label: 'None', value: 'none' }
              ]
            },
            {
              key: 'workbench.startupEditor',
              label: 'Startup Editor',
              type: 'select',
              defaultValue: 'welcomePage',
              options: [
                { label: 'Welcome Page', value: 'welcomePage' },
                { label: 'New Untitled File', value: 'newUntitledFile' },
                { label: 'None', value: 'none' }
              ]
            }
          ]
        },
        {
          id: 'terminal',
          title: 'Terminal',
          collapsible: true,
          fields: [
            {
              key: 'terminal.integrated.fontSize',
              label: 'Terminal Font Size',
              type: 'number',
              defaultValue: 12
            },
            {
              key: 'terminal.integrated.shell.osx',
              label: 'Shell (macOS)',
              type: 'path',
              defaultValue: '/bin/zsh',
              dependsOn: { field: 'platform', value: 'darwin' }
            },
            {
              key: 'terminal.integrated.shell.linux',
              label: 'Shell (Linux)',
              type: 'path',
              defaultValue: '/bin/bash',
              dependsOn: { field: 'platform', value: 'linux' }
            }
          ]
        }
      ]
    }
  },

  // SSH configuration
  {
    id: 'ssh',
    name: 'ssh',
    displayName: 'SSH Config',
    icon: 'key',
    category: 'tools',
    description: 'SSH client configuration',
    isComplete: false,  // Not yet implemented
    configPaths: {
      darwin: '~/.ssh/config',
      linux: '~/.ssh/config',
      win32: '~/.ssh/config'
    },
    format: 'custom',
    schema: {
      sections: [
        {
          id: 'hosts',
          title: 'SSH Hosts',
          fields: [
            {
              key: 'hosts',
              label: 'Host Configurations',
              type: 'array',
              defaultValue: [],
              description: 'Define SSH host configurations'
            }
          ]
        },
        {
          id: 'defaults',
          title: 'Default Settings',
          fields: [
            {
              key: 'ServerAliveInterval',
              label: 'Server Alive Interval',
              type: 'number',
              defaultValue: 60,
              description: 'Seconds between keepalive messages'
            },
            {
              key: 'ServerAliveCountMax',
              label: 'Server Alive Count Max',
              type: 'number',
              defaultValue: 3,
              description: 'Number of keepalive messages before disconnect'
            },
            {
              key: 'StrictHostKeyChecking',
              label: 'Strict Host Key Checking',
              type: 'select',
              defaultValue: 'ask',
              options: [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
                { label: 'Ask', value: 'ask' }
              ]
            }
          ]
        }
      ]
    }
  },

  // Tmux configuration
  {
    id: 'tmux',
    name: 'tmux',
    displayName: 'Tmux',
    icon: 'layers',
    category: 'terminal',
    description: 'Terminal multiplexer configuration',
    isComplete: false,  // Not yet implemented
    configPaths: {
      darwin: '~/.tmux.conf',
      linux: '~/.tmux.conf',
      win32: ''
    },
    format: 'plain',
    schema: {
      sections: [
        {
          id: 'basic',
          title: 'Basic Settings',
          fields: [
            {
              key: 'prefix',
              label: 'Prefix Key',
              type: 'keymap',
              defaultValue: 'C-b',
              description: 'The prefix key combination'
            },
            {
              key: 'mouse',
              label: 'Enable Mouse',
              type: 'boolean',
              defaultValue: true,
              description: 'Enable mouse support'
            },
            {
              key: 'base-index',
              label: 'Base Index',
              type: 'number',
              defaultValue: 1,
              description: 'Starting index for windows and panes'
            },
            {
              key: 'history-limit',
              label: 'History Limit',
              type: 'number',
              defaultValue: 10000,
              description: 'Number of lines to keep in history'
            }
          ]
        },
        {
          id: 'appearance',
          title: 'Appearance',
          fields: [
            {
              key: 'status-position',
              label: 'Status Bar Position',
              type: 'select',
              defaultValue: 'bottom',
              options: [
                { label: 'Top', value: 'top' },
                { label: 'Bottom', value: 'bottom' }
              ]
            },
            {
              key: 'status-style',
              label: 'Status Bar Style',
              type: 'string',
              defaultValue: 'bg=green,fg=black',
              description: 'Status bar color scheme'
            }
          ]
        }
      ]
    }
  }
]

// Helper function to get software by ID
export function getSoftwareById(id: string): SoftwareDefinition | undefined {
  return softwareDefinitions.find(sw => sw.id === id)
}

// Helper function to get software by category
export function getSoftwareByCategory(category: string): SoftwareDefinition[] {
  return softwareDefinitions.filter(sw => sw.category === category)
}

// Get all unique categories
export function getCategories(): string[] {
  return Array.from(new Set(softwareDefinitions.map(sw => sw.category)))
}