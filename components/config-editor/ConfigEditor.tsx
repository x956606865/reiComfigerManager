'use client'

import { useState, useEffect } from 'react'
import { SoftwareDefinition } from '@/types/software'
import { parseZshConfig, stringifyZshConfig, ZshConfig, VariableInfo } from '@/lib/zsh-parser'
import { EnvironmentVariableEditor } from './EnvironmentVariableEditor'
import { PathEditor } from './PathEditor'
import { AliasEditor } from './AliasEditor'
import { Code, Eye, Settings } from 'lucide-react'

interface ConfigEditorProps {
  software: SoftwareDefinition
  config: string
  onChange: (config: string) => void
}

type EditorMode = 'visual' | 'source'

export function ConfigEditor({ software, config, onChange }: ConfigEditorProps) {
  const [mode, setMode] = useState<EditorMode>('visual')
  const [parsedConfig, setParsedConfig] = useState<ZshConfig | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  useEffect(() => {
    if (software.id === 'zsh') {
      try {
        const parsed = parseZshConfig(config)
        setParsedConfig(parsed)
        setParseError(null)
      } catch (err) {
        setParseError(err instanceof Error ? err.message : 'Failed to parse configuration')
      }
    }
  }, [config, software.id])

  const handleVisualChange = (newConfig: ZshConfig) => {
    setParsedConfig(newConfig)
    const stringified = stringifyZshConfig(newConfig)
    onChange(stringified)
  }

  const handleSourceChange = (newContent: string) => {
    onChange(newContent)
  }

  // For now, only Zsh is fully implemented
  if (software.id !== 'zsh') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Configuration editor for {software.displayName} is coming soon.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMode('visual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'visual'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Eye className="h-4 w-4" />
            Visual Editor
          </button>
          <button
            onClick={() => setMode('source')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              mode === 'source'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Code className="h-4 w-4" />
            Source Code
          </button>
          
          {parseError && mode === 'visual' && (
            <div className="ml-auto text-sm text-red-600 dark:text-red-400">
              Parse error: {parseError}
            </div>
          )}
        </div>
      </div>

      {/* Editor content */}
      {mode === 'visual' ? (
        parsedConfig ? (
          <div className="space-y-4">
            {/* Environment Variables Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Environment Variables
                </h2>
              </div>
              <div className="p-4">
                <EnvironmentVariableEditor
                  variables={parsedConfig.environmentVariables}
                  onChange={(vars: Record<string, string | VariableInfo>) => handleVisualChange({
                    ...parsedConfig,
                    environmentVariables: vars
                  })}
                />
              </div>
            </div>

            {/* PATH Variable Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold">PATH Configuration</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Manage directories in your system PATH
                </p>
              </div>
              <div className="p-4">
                <PathEditor
                  paths={parsedConfig.paths}
                  onChange={(paths) => handleVisualChange({
                    ...parsedConfig,
                    paths
                  })}
                />
              </div>
            </div>

            {/* Aliases Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold">Aliases</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Create shortcuts for frequently used commands
                </p>
              </div>
              <div className="p-4">
                <AliasEditor
                  aliases={parsedConfig.aliases}
                  onChange={(aliases: Record<string, string | VariableInfo>) => handleVisualChange({
                    ...parsedConfig,
                    aliases
                  })}
                />
              </div>
            </div>

            {/* Other Configurations */}
            {parsedConfig.otherLines.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <div className="p-4 border-b dark:border-gray-700">
                  <h2 className="text-lg font-semibold">Other Configurations</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Additional configuration lines not recognized by the visual editor
                  </p>
                </div>
                <div className="p-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded overflow-x-auto text-sm">
                    {parsedConfig.otherLines.join('\n')}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              Unable to parse the configuration file. Switch to source code mode to edit directly.
            </p>
          </div>
        )
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <textarea
            value={config}
            onChange={(e) => handleSourceChange(e.target.value)}
            className="w-full h-[600px] p-4 font-mono text-sm bg-transparent resize-none focus:outline-none"
            placeholder="Enter your configuration here..."
            spellCheck={false}
          />
        </div>
      )}
    </div>
  )
}