'use client'

import { useMemo } from 'react'
import * as diff from 'diff'
import { X, Plus, Minus, FileText, GitCompare } from 'lucide-react'

interface DiffViewerProps {
  oldContent: string
  newContent: string
  oldLabel?: string
  newLabel?: string
  isOpen: boolean
  onClose: () => void
}

export function DiffViewer({ 
  oldContent, 
  newContent, 
  oldLabel = 'Previous Version',
  newLabel = 'Selected Version',
  isOpen,
  onClose 
}: DiffViewerProps) {
  const changes = useMemo(() => {
    return diff.diffLines(oldContent, newContent)
  }, [oldContent, newContent])

  const stats = useMemo(() => {
    let added = 0
    let removed = 0
    
    changes.forEach(change => {
      const lineCount = change.count || 0
      if (change.added) {
        added += lineCount
      } else if (change.removed) {
        removed += lineCount
      }
    })
    
    return { added, removed }
  }, [changes])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full h-[80vh] mx-4 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <GitCompare className="h-5 w-5" />
                Configuration Diff Preview
              </h2>
              <div className="flex items-center gap-4 mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Comparing: <span className="font-medium">{oldLabel}</span> → <span className="font-medium">{newLabel}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Plus className="h-4 w-4" />
                    {stats.added} added
                  </span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <Minus className="h-4 w-4" />
                    {stats.removed} removed
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Diff Content */}
        <div className="flex-1 overflow-auto p-6">
          {changes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mb-2" />
              <p>No differences found</p>
            </div>
          ) : (
            <div className="font-mono text-sm">
              {changes.map((change, index) => {
                const lines = change.value.split('\n').filter((line, i, arr) => 
                  // Remove last empty line if it exists
                  !(i === arr.length - 1 && line === '')
                )
                
                if (change.added) {
                  return (
                    <div key={index} className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
                      {lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="px-4 py-0.5 text-green-700 dark:text-green-300">
                          <span className="select-none text-green-500 mr-4">+</span>
                          {line || ' '}
                        </div>
                      ))}
                    </div>
                  )
                } else if (change.removed) {
                  return (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                      {lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="px-4 py-0.5 text-red-700 dark:text-red-300">
                          <span className="select-none text-red-500 mr-4">-</span>
                          {line || ' '}
                        </div>
                      ))}
                    </div>
                  )
                } else {
                  return (
                    <div key={index}>
                      {lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="px-4 py-0.5 text-gray-700 dark:text-gray-300">
                          <span className="select-none text-gray-400 mr-4"> </span>
                          {line || ' '}
                        </div>
                      ))}
                    </div>
                  )
                }
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use this preview to understand what changes will be applied when restoring this version
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}