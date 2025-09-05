'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Terminal, ToggleLeft, ToggleRight } from 'lucide-react';
import { EditModal } from '@/components/ui/EditModal';
import { VariableInfo } from '@/lib/zsh-parser';

interface AliasEditorProps {
  aliases: Record<string, string | VariableInfo>;
  onChange: (aliases: Record<string, string | VariableInfo>) => void;
}

interface EditingAlias {
  name: string;
  command: string;
  originalName?: string;
  isNew?: boolean;
}

// Common alias suggestions
const commonAliases = [
  { name: 'll', command: 'ls -la', description: 'List all files with details' },
  {
    name: 'la',
    command: 'ls -A',
    description: 'List all files except . and ..',
  },
  { name: 'l', command: 'ls -CF', description: 'List files in columns' },
  { name: '..', command: 'cd ..', description: 'Go to parent directory' },
  { name: '...', command: 'cd ../..', description: 'Go up two directories' },
  { name: 'g', command: 'git', description: 'Shortcut for git' },
  { name: 'gs', command: 'git status', description: 'Git status' },
  { name: 'ga', command: 'git add', description: 'Git add' },
  { name: 'gc', command: 'git commit', description: 'Git commit' },
  { name: 'gp', command: 'git push', description: 'Git push' },
  { name: 'gl', command: 'git log', description: 'Git log' },
  { name: 'gd', command: 'git diff', description: 'Git diff' },
  { name: 'h', command: 'history', description: 'Command history' },
  { name: 'c', command: 'clear', description: 'Clear terminal' },
  {
    name: 'reload',
    command: 'source ~/.zshrc',
    description: 'Reload zsh config',
  },
];

export function AliasEditor({ aliases, onChange }: AliasEditorProps) {
  const [editingAlias, setEditingAlias] = useState<EditingAlias | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAdd = () => {
    setEditingAlias({ name: '', command: '', isNew: true });
  };

  const handleEdit = (name: string, command: string) => {
    setEditingAlias({ name, command, originalName: name });
  };

  const handleSave = (data: { key?: string; value: string }) => {
    if (!editingAlias || !data.key || !data.value) return;

    const newAliases = { ...aliases };

    // Check for duplicate key (only for new aliases or when renaming)
    if ((!editingAlias.originalName || editingAlias.originalName !== data.key) && 
        data.key in newAliases) {
      if (!confirm(`Alias "${data.key}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }

    // If editing existing alias and name changed, delete old name
    if (editingAlias.originalName && editingAlias.originalName !== data.key) {
      delete newAliases[editingAlias.originalName];
    }

    // Preserve suffix if editing existing alias with suffix
    const existingAlias = editingAlias.originalName ? aliases[editingAlias.originalName] : null;
    const suffix = existingAlias && typeof existingAlias === 'object' ? existingAlias.suffix : undefined;
    
    // Add/update the alias
    newAliases[data.key] = suffix 
      ? { value: data.value, suffix }
      : data.value;

    onChange(newAliases);
    setEditingAlias(null);
  };

  const handleCancel = () => {
    setEditingAlias(null);
  };

  const handleDelete = (name: string) => {
    const newAliases = { ...aliases };
    delete newAliases[name];
    onChange(newAliases);
  };

  const handleToggleDisabled = (name: string) => {
    const newAliases = { ...aliases };
    const currentAlias = newAliases[name];
    
    if (typeof currentAlias === 'string') {
      // Convert to object format and set disabled
      newAliases[name] = { value: currentAlias, disabled: true };
    } else {
      // Toggle disabled state
      newAliases[name] = { ...currentAlias, disabled: !currentAlias.disabled };
    }
    
    onChange(newAliases);
  };

  const handleApplySuggestion = (suggestion: (typeof commonAliases)[0]) => {
    const newAliases = { ...aliases };
    newAliases[suggestion.name] = suggestion.command;
    onChange(newAliases);
  };

  const unusedSuggestions = commonAliases.filter((s) => !aliases[s.name]);

  return (
    <div className="space-y-2">
      {/* Existing aliases */}
      {Object.entries(aliases).map(([name, commandOrInfo]) => {
        const command = typeof commandOrInfo === 'string' ? commandOrInfo : commandOrInfo.value;
        const suffix = typeof commandOrInfo === 'object' ? commandOrInfo.suffix : undefined;
        const isDisabled = typeof commandOrInfo === 'object' ? commandOrInfo.disabled : false;
        
        return (
        <div
          key={name}
          className={`flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded group ${isDisabled ? 'opacity-50' : ''}`}
        >
          <Terminal className="h-4 w-4 text-gray-400" />
          <span className={`w-32 font-mono text-sm text-purple-600 dark:text-purple-400 ${isDisabled ? 'line-through' : ''}`}>
            {name}
          </span>
          <span className="text-gray-500">=</span>
          <div className="flex-1 flex items-center gap-2">
            <span className={`font-mono text-sm text-gray-700 dark:text-gray-300 ${isDisabled ? 'line-through' : ''}`}>
              {command}
            </span>
            {suffix && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono" title="Additional command">
                {suffix}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => {
                const cmd = typeof commandOrInfo === 'string' ? commandOrInfo : commandOrInfo.value;
                handleEdit(name, cmd);
              }}
              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleToggleDisabled(name)}
              className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${isDisabled ? 'text-green-600' : 'text-orange-600'}`}
              title={isDisabled ? 'Enable' : 'Disable'}
            >
              {isDisabled ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
            </button>
            <button
              onClick={() => handleDelete(name)}
              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        );
      })}

      {/* Edit Modal */}
      {editingAlias && (
        <EditModal
          isOpen={true}
          title={editingAlias.isNew ? 'Add Alias' : 'Edit Alias'}
          fields={{
            key: {
              label: 'Alias Name',
              value: editingAlias.name,
              placeholder: 'alias',
            },
            value: {
              label: 'Command',
              value: editingAlias.command,
              placeholder: 'command',
            },
          }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!editingAlias && (
          <>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 flex-1 p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded hover:border-primary hover:bg-primary/5 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Alias</span>
            </button>
            {unusedSuggestions.length > 0 && (
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Suggestions ({unusedSuggestions.length})
              </button>
            )}
          </>
        )}
      </div>

      {/* Suggestions */}
      {showSuggestions && unusedSuggestions.length > 0 && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Common Aliases</h4>
          <div className="space-y-1">
            {unusedSuggestions.map((suggestion) => (
              <div
                key={suggestion.name}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <span className="w-20 font-mono text-sm text-purple-600 dark:text-purple-400">
                  {suggestion.name}
                </span>
                <span className="text-gray-500">=</span>
                <span className="flex-1 font-mono text-sm text-gray-700 dark:text-gray-300">
                  {suggestion.command}
                </span>
                <span className="text-xs text-gray-500">
                  {suggestion.description}
                </span>
                <button
                  onClick={() => handleApplySuggestion(suggestion)}
                  className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {Object.keys(aliases).length === 0 &&
        !editingAlias &&
        !showSuggestions && (
          <div className="text-center py-8 text-gray-500">
            <p>No aliases defined</p>
            <p className="text-sm mt-1">
              Create shortcuts for your frequently used commands
            </p>
          </div>
        )}
    </div>
  );
}
