'use client'

import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { formatDistanceToNow } from 'date-fns'
import { toast } from '@/lib/toast'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DiffViewer } from '@/components/ui/DiffViewer'
import { 
  Clock, 
  RotateCcw, 
  Trash2, 
  Save,
  ChevronDown,
  ChevronRight,
  Archive,
  FileText,
  Settings,
  Loader2,
  Eye
} from 'lucide-react'

interface ConfigVersion {
  id: string
  software_id: string
  content: string
  parsed_content?: any
  checksum: string
  created_at: string
  note?: string
  is_auto_save: boolean
}

interface VersionHistoryProps {
  softwareId: string
  onRestore?: (version: ConfigVersion) => void
  onVersionChange?: () => void
}

export function VersionHistory({ 
  softwareId, 
  onRestore,
  onVersionChange 
}: VersionHistoryProps) {
  const [versions, setVersions] = useState<ConfigVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [_maxVersions, setMaxVersions] = useState<number>(20)
  const [showSettings, setShowSettings] = useState(false)
  const [tempMaxVersions, setTempMaxVersions] = useState<number>(20)
  const [operationInProgress, setOperationInProgress] = useState<string | null>(null)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} })
  const [backupNote, setBackupNote] = useState('')
  const [showBackupDialog, setShowBackupDialog] = useState(false)
  const [diffPreview, setDiffPreview] = useState<{
    isOpen: boolean
    oldContent: string
    newContent: string
    oldLabel: string
    newLabel: string
  }>({ isOpen: false, oldContent: '', newContent: '', oldLabel: '', newLabel: '' })

  useEffect(() => {
    loadVersionHistory()
    loadMaxVersions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [softwareId])

  const loadVersionHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const history = await invoke<ConfigVersion[]>('get_version_history', {
        softwareId,
        limit: 50
      })
      setVersions(history)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load version history')
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = async (version: ConfigVersion) => {
    setOperationInProgress(version.id)
    
    try {
      // Get current configuration
      const currentResult = await invoke<{ content: string } | null>('read_config', {
        softwareId
      })
      
      const currentContent = currentResult?.content || ''
      
      setDiffPreview({
        isOpen: true,
        oldContent: currentContent,
        newContent: version.content,
        oldLabel: 'Current Configuration',
        newLabel: `Version from ${formatDate(version.created_at)}`
      })
    } catch (err) {
      toast.error('Failed to load preview', String(err))
    } finally {
      setOperationInProgress(null)
    }
  }

  const loadMaxVersions = async () => {
    try {
      const max = await invoke<number>('get_max_versions', { softwareId })
      setMaxVersions(max)
      setTempMaxVersions(max)
    } catch (err) {
      console.error('Failed to load max versions:', err)
    }
  }

  const handleRestore = async (version: ConfigVersion) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Restore Version',
      message: `Are you sure you want to restore this version from ${formatDate(version.created_at)}? Your current configuration will be saved as a new version.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        setOperationInProgress(version.id)
        
        try {
          await invoke('restore_version', {
            softwareId,
            versionId: version.id
          })
          
          toast.success('Version restored successfully', 'Your configuration has been restored to the selected version.')
          
          if (onRestore) {
            onRestore(version)
          }
          
          // Reload history to show the new restore entry
          await loadVersionHistory()
          
          if (onVersionChange) {
            onVersionChange()
          }
        } catch (err) {
          toast.error('Failed to restore version', String(err))
        } finally {
          setOperationInProgress(null)
        }
      }
    })
  }

  const handleDelete = async (version: ConfigVersion) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Version',
      message: 'Are you sure you want to delete this version? This action cannot be undone.',
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        setOperationInProgress(version.id)
        
        try {
          await invoke('delete_version', {
            softwareId,
            versionId: version.id
          })
          
          toast.success('Version deleted', 'The version has been removed from history.')
          await loadVersionHistory()
        } catch (err) {
          toast.error('Failed to delete version', String(err))
        } finally {
          setOperationInProgress(null)
        }
      }
    })
  }

  const handleCreateBackup = async () => {
    setShowBackupDialog(true)
    setBackupNote('')
  }

  const confirmCreateBackup = async () => {
    setShowBackupDialog(false)
    setOperationInProgress('creating-backup')
    
    try {
      await invoke('create_backup', {
        softwareId,
        note: backupNote || 'Manual backup'
      })
      
      toast.success('Backup created', 'A new backup has been saved to version history.')
      await loadVersionHistory()
      
      if (onVersionChange) {
        onVersionChange()
      }
    } catch (err) {
      toast.error('Failed to create backup', String(err))
    } finally {
      setOperationInProgress(null)
      setBackupNote('')
    }
  }

  const handleUpdateMaxVersions = async () => {
    setOperationInProgress('updating-settings')
    
    try {
      await invoke('set_max_versions', {
        softwareId,
        maxVersions: tempMaxVersions
      })
      setMaxVersions(tempMaxVersions)
      setShowSettings(false)
      toast.success('Settings updated', `Maximum versions set to ${tempMaxVersions}`)
    } catch (err) {
      toast.error('Failed to update settings', String(err))
    } finally {
      setOperationInProgress(null)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return 'Unknown date'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    return date.toLocaleString()
  }

  const formatRelativeTime = (dateString: string) => {
    if (!dateString) {
      return 'Unknown time'
    }
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Invalid time'
    }
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const getVersionIcon = (version: ConfigVersion) => {
    if (version.note?.includes('Restored from')) {
      return <RotateCcw className="h-4 w-4 text-blue-500" />
    }
    if (!version.is_auto_save) {
      return <Archive className="h-4 w-4 text-green-500" />
    }
    return <Save className="h-4 w-4 text-gray-400" />
  }

  const getVersionLabel = (version: ConfigVersion) => {
    if (version.note?.includes('Restored from')) {
      return 'Restore'
    }
    if (!version.is_auto_save) {
      return 'Backup'
    }
    return 'Auto-save'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Version History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateBackup}
              disabled={operationInProgress === 'creating-backup'}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              title="Create backup"
            >
              {operationInProgress === 'creating-backup' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </p>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Max versions to keep:</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tempMaxVersions}
                  onChange={(e) => setTempMaxVersions(Number(e.target.value))}
                  className="w-20 px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button
                  onClick={handleUpdateMaxVersions}
                  disabled={operationInProgress === 'updating-settings'}
                  className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                >
                  {operationInProgress === 'updating-settings' ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No version history yet</p>
            <p className="text-xs mt-1">Versions will appear here when you save changes</p>
          </div>
        ) : (
          <div className="p-2">
            {versions.map((version, index) => (
              <div
                key={version.id}
                className="mb-2 border dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => setExpandedVersion(
                    expandedVersion === version.id ? null : version.id
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {expandedVersion === version.id ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getVersionIcon(version)}
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {getVersionLabel(version)}
                        </span>
                        {index === 0 && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span title={formatDate(version.created_at)}>
                          {formatRelativeTime(version.created_at)}
                        </span>
                      </div>
                      
                      {version.note && (
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {version.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Actions */}
                {expandedVersion === version.id && (
                  <div className="px-3 pb-3 border-t dark:border-gray-700">
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handlePreview(version)}
                        disabled={operationInProgress === version.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                      >
                        {operationInProgress === version.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><Eye className="h-3 w-3" />Preview</>
                        )}
                      </button>
                      <button
                        onClick={() => handleRestore(version)}
                        disabled={index === 0 || operationInProgress === version.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {operationInProgress === version.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><RotateCcw className="h-3 w-3" />Restore</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(version)}
                        disabled={operationInProgress === version.id}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm border border-red-500 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        {operationInProgress === version.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <><Trash2 className="h-3 w-3" />Delete</>
                        )}
                      </button>
                    </div>
                    
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Version ID:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">
                          {version.id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Checksum:</span>
                        <span className="font-mono text-gray-700 dark:text-gray-300">
                          {version.checksum.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="warning"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Backup Note Dialog */}
      {showBackupDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowBackupDialog(false)}
          />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6 animate-scale-in">
            <h3 className="text-lg font-semibold mb-4">Create Backup</h3>
            <label className="block text-sm font-medium mb-2">
              Backup note (optional):
            </label>
            <input
              type="text"
              value={backupNote}
              onChange={(e) => setBackupNote(e.target.value)}
              placeholder="Enter a description for this backup"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              autoFocus
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowBackupDialog(false)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmCreateBackup}
                className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Create Backup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diff Preview Dialog */}
      <DiffViewer
        isOpen={diffPreview.isOpen}
        oldContent={diffPreview.oldContent}
        newContent={diffPreview.newContent}
        oldLabel={diffPreview.oldLabel}
        newLabel={diffPreview.newLabel}
        onClose={() => setDiffPreview(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  )
}