'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { invoke } from '@tauri-apps/api/core'
import { getSoftwareById } from '@/lib/software-definitions'
import { SoftwareDefinition } from '@/types/software'
import { ConfigEditor } from '@/components/config-editor/ConfigEditor'
import { VersionHistory } from '@/components/config-editor/VersionHistory'
import { toast } from '@/lib/toast'
import { ArrowLeft, Save, RotateCcw, Download, Upload, History, X } from 'lucide-react'

interface SoftwareConfigEditorProps {
  softwareId: string
}

export function SoftwareConfigEditor({ softwareId }: SoftwareConfigEditorProps) {
  const router = useRouter()
  const [software, setSoftware] = useState<SoftwareDefinition | null>(null)
  const [config, setConfig] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  useEffect(() => {
    loadSoftwareAndConfig()
  }, [softwareId])

  const loadSoftwareAndConfig = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get software definition
      const softwareDef = getSoftwareById(softwareId)
      if (!softwareDef) {
        setError('Software not found')
        return
      }
      
      // Check if software is complete
      if (softwareDef.isComplete === false) {
        setError('This software configuration is not yet available')
        return
      }

      setSoftware(softwareDef)

      // Try to load existing config
      try {
        const result = await invoke<{ content: string } | null>('read_config', {
          softwareId: softwareId
        })
        if (result) {
          setConfig(result.content)
        }
      } catch (err) {
        // Config might not exist yet, that's ok
        console.log('No existing config found')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (note?: string) => {
    if (!software) return

    try {
      setSaving(true)
      setError(null)

      // Parse the config based on format
      let parsedContent = {}
      try {
        if (software.format === 'json') {
          parsedContent = JSON.parse(config)
        } else if (software.format === 'plain') {
          // For plain text, convert to the format expected by PlainParser
          const lines = config.split('\n').map(line => line)
          parsedContent = { content: lines }
        } else {
          // For other formats (yaml, toml, etc.), send as raw
          parsedContent = { raw: config }
        }
      } catch (parseErr) {
        // If parsing fails, send as raw
        parsedContent = { raw: config }
      }

      await invoke('save_software_config', {
        softwareId: softwareId,
        content: config,
        parsedContent: parsedContent,
        note: note || 'Manual save'
      })

      setHasUnsavedChanges(false)
      toast.success('Configuration saved', 'Your changes have been saved successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Are you sure you want to reset?')) {
        return
      }
    }
    loadSoftwareAndConfig()
    setHasUnsavedChanges(false)
  }

  const handleConfigChange = (newConfig: string) => {
    setConfig(newConfig)
    setHasUnsavedChanges(true)
  }

  const handleVersionRestore = async (version: any) => {
    // Reload the config after restoration
    await loadSoftwareAndConfig()
    setHasUnsavedChanges(false)
  }

  const handleVersionChange = async () => {
    // Optionally reload the version history
  }

  const handleExport = () => {
    const blob = new Blob([config], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${software?.name || 'config'}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Configuration exported', 'The configuration has been downloaded to your computer.')
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.txt,.zshrc,.bashrc,.vimrc,.gitconfig'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        setConfig(text)
        setHasUnsavedChanges(true)
        toast.info('Configuration imported', 'The file has been loaded. Remember to save your changes.')
      }
    }
    input.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error</h2>
          <p className="text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  if (!software) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">{software.displayName} Configuration</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{software.description}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVersionHistory(!showVersionHistory)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showVersionHistory 
                    ? 'bg-primary text-white border-primary' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {showVersionHistory ? <X className="h-4 w-4" /> : <History className="h-4 w-4" />}
                {showVersionHistory ? 'Hide History' : 'Show History'}
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Upload className="h-4 w-4" />
                Import
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={() => handleSave()}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Config Editor */}
        <div className={`flex-1 ${showVersionHistory ? 'border-r dark:border-gray-700' : ''}`}>
          <div className="h-full px-6 py-6 overflow-auto">
            <ConfigEditor
              software={software}
              config={config}
              onChange={handleConfigChange}
            />
          </div>
        </div>

        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="w-96 bg-white dark:bg-gray-800 shadow-lg">
            <VersionHistory
              softwareId={softwareId}
              onRestore={handleVersionRestore}
              onVersionChange={handleVersionChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}