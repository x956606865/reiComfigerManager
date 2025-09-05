'use client'

import { useState, useMemo } from 'react'
import {
  environmentVariablesKnowledge,
  getEnvVariableInfo,
  searchVariables,
  getDefaultValue,
  validateValue,
  getAllCategories,
  getSuggestedVariables,
} from '@/lib/environment-variables-knowledge'
import { Plus, Trash2, HelpCircle, Edit2, Copy, MoreVertical, Sparkles } from 'lucide-react'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { EditModal } from '@/components/ui/EditModal'
import { AutoCompleteInput, AutoCompleteSuggestion } from '@/components/ui/AutoCompleteInput'
import { toast } from '@/lib/toast'
import { VariableInfo } from '@/lib/zsh-parser'

interface EnvironmentVariableEditorProps {
  variables: Record<string, string | VariableInfo>
  onChange: (variables: Record<string, string | VariableInfo>) => void
}

interface EditingVariable {
  key: string
  value: string
  originalKey?: string
  isNew?: boolean
}

export function EnvironmentVariableEditor({
  variables,
  onChange
}: EnvironmentVariableEditorProps) {
  const [editingVar, setEditingVar] = useState<EditingVariable | null>(null)
  const [hoveredVar, setHoveredVar] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; key: string; value: string; position?: { x: number; y: number } }>({ isOpen: false, key: '', value: '' })
  const [showingSuggestions, setShowingSuggestions] = useState(false)
  
  // Convert variable knowledge to autocomplete suggestions
  const autoCompleteSuggestions = useMemo((): AutoCompleteSuggestion[] => {
    return Object.values(environmentVariablesKnowledge).map((varInfo) => ({
      value: varInfo.name,
      label: varInfo.name,
      description: varInfo.description,
      category: varInfo.category,
      example: varInfo.example_values[0] || '',
    }));
  }, [])
  
  // Get suggested variables that aren't set yet
  const suggestedVars = useMemo(() => {
    const existingKeys = new Set(Object.keys(variables));
    return getSuggestedVariables(existingKeys);
  }, [variables])

  const handleAdd = () => {
    setEditingVar({ key: '', value: '', isNew: true })
  }
  
  const handleQuickAdd = (varName: string) => {
    const varInfo = getEnvVariableInfo(varName);
    if (varInfo) {
      const defaultVal = getDefaultValue(varInfo);
      setEditingVar({ key: varName, value: defaultVal, isNew: true });
    }
  }

  const handleEdit = (key: string, value: string) => {
    setEditingVar({ key, value, originalKey: key })
  }

  const handleSave = (data: { key?: string; value: string }) => {
    if (!editingVar || !data.key) return

    const newVariables = { ...variables }

    // If editing existing variable and key changed, delete old key
    if (editingVar.originalKey && editingVar.originalKey !== data.key) {
      delete newVariables[editingVar.originalKey]
    }

    // Preserve suffix if editing existing variable with suffix
    const existingVar = editingVar.originalKey ? variables[editingVar.originalKey] : null
    const suffix = existingVar && typeof existingVar === 'object' ? existingVar.suffix : undefined
    
    // Add/update the variable
    newVariables[data.key] = suffix 
      ? { value: data.value, suffix }
      : data.value

    onChange(newVariables)
    setEditingVar(null)
  }

  const handleCancel = () => {
    setEditingVar(null)
  }

  const handleDelete = (key: string) => {
    const newVariables = { ...variables }
    delete newVariables[key]
    onChange(newVariables)
  }

  return (
    <div className="space-y-2">
      {/* Existing variables */}
      {Object.entries(variables).map(([key, valueOrInfo]) => {
        const value = typeof valueOrInfo === 'string' ? valueOrInfo : valueOrInfo.value
        const suffix = typeof valueOrInfo === 'object' ? valueOrInfo.suffix : undefined
        const info = getEnvVariableInfo(key)

        return (
          <div
            key={key}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg group transition-colors cursor-pointer select-none"
            onMouseEnter={() => setHoveredVar(key)}
            onMouseLeave={() => setHoveredVar(null)}
            onClick={(e) => {
              e.stopPropagation()
              setContextMenu({
                isOpen: true,
                key,
                value,
                position: {
                  x: Math.min(e.clientX, window.innerWidth - 200),
                  y: Math.min(e.clientY, window.innerHeight - 200)
                }
              })
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-none w-32 sm:w-48">
                <span className="font-mono text-sm text-blue-600 dark:text-blue-400 truncate" title={key}>
                  {key}
                </span>
                {info && (
                  <div className="relative flex-shrink-0">
                    <HelpCircle className="h-3 w-3 text-gray-400" />
                    {hoveredVar === key && (
                      <div className="absolute z-10 bottom-full left-0 mb-1 w-80 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="font-semibold">{info.name}</div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-700 rounded">
                            {info.category}
                          </span>
                        </div>
                        <div className="text-gray-200 leading-relaxed">{info.description}</div>
                        {info.value_format && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="text-gray-400">格式：</div>
                            <div className="text-gray-200">{info.value_format}</div>
                          </div>
                        )}
                        {info.example_values && info.example_values.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="text-gray-400">示例：</div>
                            <div className="font-mono text-green-400 text-[10px]">
                              {info.example_values.slice(0, 2).join('\n')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-gray-500 hidden sm:block">=</span>
              <div className="flex-1 flex items-center gap-2">
                <span className="font-mono text-sm text-gray-700 dark:text-gray-300 truncate" title={value}>
                  {value}
                </span>
                {suffix && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono" title="Additional command">
                    {suffix}
                  </span>
                )}
              </div>
              <MoreVertical className="h-4 w-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )
      })}

      {/* Edit Modal with AutoComplete */}
      {editingVar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              {editingVar.isNew ? 'Add Environment Variable' : 'Edit Environment Variable'}
            </h2>
            
            <div className="space-y-4">
              {/* Variable Name with AutoComplete */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Variable Name
                </label>
                {editingVar.isNew ? (
                  <AutoCompleteInput
                    value={editingVar.key}
                    onChange={(val) => setEditingVar({ ...editingVar, key: val })}
                    onSelect={(suggestion) => {
                      const varInfo = getEnvVariableInfo(suggestion.value);
                      if (varInfo) {
                        const defaultVal = getDefaultValue(varInfo);
                        setEditingVar({ ...editingVar, key: suggestion.value, value: defaultVal });
                      }
                    }}
                    suggestions={autoCompleteSuggestions}
                    placeholder="Enter variable name..."
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={editingVar.key}
                    onChange={(e) => setEditingVar({ ...editingVar, key: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700"
                    disabled={!editingVar.isNew}
                  />
                )}
              </div>
              
              {/* Variable Value */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Variable Value
                </label>
                <input
                  type="text"
                  value={editingVar.value}
                  onChange={(e) => setEditingVar({ ...editingVar, value: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700"
                  placeholder="Enter value..."
                />
                
                {/* Value validation and help */}
                {editingVar.key && (() => {
                  const varInfo = getEnvVariableInfo(editingVar.key);
                  if (varInfo && editingVar.value) {
                    const validation = validateValue(varInfo, editingVar.value);
                    if (!validation.valid) {
                      return (
                        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {validation.message}
                        </div>
                      );
                    }
                  }
                  if (varInfo) {
                    return (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {varInfo.value_format}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingVar.key && editingVar.value) {
                    handleSave({ key: editingVar.key, value: editingVar.value });
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                {editingVar.isNew ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick suggestions */}
      {suggestedVars.length > 0 && !editingVar && (
        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Quick Add Common Variables
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedVars.map((varInfo) => (
              <button
                key={varInfo.name}
                onClick={() => handleQuickAdd(varInfo.name)}
                className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                title={varInfo.description}
              >
                <span className="font-mono">{varInfo.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Add button */}
      {!editingVar && (
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Environment Variable</span>
        </button>
      )}

      {/* Empty state */}
      {Object.keys(variables).length === 0 && !editingVar && (
        <div className="text-center py-8 text-gray-500">
          <p>No environment variables defined</p>
          <p className="text-sm mt-1">Click the button above to add your first variable</p>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          isOpen={contextMenu.isOpen}
          onClose={() => setContextMenu({ isOpen: false, key: '', value: '' })}
          items={[
            {
              icon: <Edit2 className="h-4 w-4" />,
              label: 'Edit',
              action: () => {
                const varData = variables[contextMenu.key]
                const value = typeof varData === 'string' ? varData : varData.value
                handleEdit(contextMenu.key, value)
              }
            },
            {
              icon: <Copy className="h-4 w-4" />,
              label: 'Copy Value',
              action: () => {
                navigator.clipboard.writeText(contextMenu.value)
                toast.success('Value copied to clipboard')
              }
            },
            {
              icon: <Trash2 className="h-4 w-4" />,
              label: 'Delete',
              action: () => {
                handleDelete(contextMenu.key)
                toast.success(`Deleted ${contextMenu.key}`)
              },
              variant: 'danger'
            }
          ]}
          position={contextMenu.position}
        />
      )}
    </div>
  )
}