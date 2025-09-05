'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface EditModalProps {
  isOpen: boolean
  title: string
  fields: {
    key?: {
      label: string
      value: string
      placeholder?: string
      uppercase?: boolean
    }
    value: {
      label: string
      value: string
      placeholder?: string
      multiline?: boolean
    }
  }
  onSave: (data: { key?: string; value: string }) => void
  onCancel: () => void
  saveText?: string
  cancelText?: string
}

export function EditModal({
  isOpen,
  title,
  fields,
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel'
}: EditModalProps) {
  const [keyValue, setKeyValue] = useState(fields.key?.value || '')
  const [valueValue, setValueValue] = useState(fields.value.value || '')

  useEffect(() => {
    if (isOpen) {
      setKeyValue(fields.key?.value || '')
      setValueValue(fields.value.value || '')
    }
  }, [isOpen, fields])

  if (!isOpen) return null

  const handleSave = () => {
    const data = fields.key 
      ? { key: keyValue.trim(), value: valueValue.trim() }
      : { value: valueValue.trim() }
    
    if (fields.key && !keyValue.trim()) return
    if (!fields.value.multiline && !valueValue.trim()) return
    
    onSave(data)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !fields.value.multiline) {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <button
              onClick={onCancel}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {fields.key && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {fields.key.label}
                </label>
                <input
                  type="text"
                  value={keyValue}
                  onChange={(e) => setKeyValue(fields.key?.uppercase ? e.target.value.toUpperCase() : e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={fields.key.placeholder}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {fields.value.label}
              </label>
              {fields.value.multiline ? (
                <textarea
                  value={valueValue}
                  onChange={(e) => setValueValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder={fields.value.placeholder}
                  rows={5}
                  onKeyDown={handleKeyDown}
                  autoFocus={!fields.key}
                />
              ) : (
                <input
                  type="text"
                  value={valueValue}
                  onChange={(e) => setValueValue(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={fields.value.placeholder}
                  onKeyDown={handleKeyDown}
                  autoFocus={!fields.key}
                />
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={fields.key ? !keyValue.trim() : !valueValue.trim() && !fields.value.multiline}
            >
              {saveText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}