'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Folder,
  FolderX,
  FolderLock,
  Edit2,
  Copy,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Loader2,
} from 'lucide-react';
import { EditModal } from '@/components/ui/EditModal';
import { ContextMenu } from '@/components/ui/ContextMenu';
import { toast } from '@/lib/toast';
import {
  checkPathsBatch,
  quickCheckPath,
  clearPathCache,
  PathCheckResult,
} from '@/lib/path-service';

interface PathEditorProps {
  paths: string[];
  onChange: (paths: string[]) => void;
}

export function PathEditor({ paths, onChange }: PathEditorProps) {
  const [editingPath, setEditingPath] = useState<{
    value: string;
    index?: number;
    isNew?: boolean;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    index: number;
    path: string;
    position?: { x: number; y: number };
  }>({ isOpen: false, index: -1, path: '' });
  const [pathResults, setPathResults] = useState<Map<string, PathCheckResult>>(new Map());
  const [loading, setLoading] = useState(false);

  // Check all paths when component mounts or paths change
  useEffect(() => {
    const checkPaths = async () => {
      if (paths.length === 0) {
        setPathResults(new Map());
        return;
      }

      setLoading(true);
      try {
        const results = await checkPathsBatch(paths);
        const resultMap = new Map<string, PathCheckResult>();
        results.forEach((result) => {
          resultMap.set(result.original, result);
        });
        setPathResults(resultMap);
      } catch (error) {
        console.error('Failed to check paths:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPaths();
  }, [paths]);

  const handleEdit = (index: number) => {
    setEditingPath({ value: paths[index], index });
  };

  const handleSave = (data: { value: string }) => {
    if (!editingPath || !data.value) return;

    if (editingPath.isNew) {
      if (!paths.includes(data.value)) {
        onChange([...paths, data.value]);
        // Clear cache for the new path to force re-check
        clearPathCache(data.value);
      }
    } else if (editingPath.index !== undefined) {
      const oldPath = paths[editingPath.index];
      const newPaths = [...paths];
      newPaths[editingPath.index] = data.value;
      onChange(newPaths);
      // Clear cache for both old and new paths
      clearPathCache(oldPath);
      clearPathCache(data.value);
    }

    setEditingPath(null);
  };

  const handleCancel = () => {
    setEditingPath(null);
  };

  const handleDelete = (index: number) => {
    const newPaths = paths.filter((_, i) => i !== index);
    onChange(newPaths);
  };

  const handleAdd = () => {
    setEditingPath({ value: '', isNew: true });
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newPaths = [...paths];
    [newPaths[index - 1], newPaths[index]] = [newPaths[index], newPaths[index - 1]];
    onChange(newPaths);
  };

  const moveDown = (index: number) => {
    if (index >= paths.length - 1) return;
    const newPaths = [...paths];
    [newPaths[index], newPaths[index + 1]] = [newPaths[index + 1], newPaths[index]];
    onChange(newPaths);
  };

  const moveToTop = (index: number) => {
    if (index === 0) return;
    const newPaths = [...paths];
    const [path] = newPaths.splice(index, 1);
    newPaths.unshift(path);
    onChange(newPaths);
  };

  const moveToBottom = (index: number) => {
    if (index === paths.length - 1) return;
    const newPaths = [...paths];
    const [path] = newPaths.splice(index, 1);
    newPaths.push(path);
    onChange(newPaths);
  };

  const getPathStatus = (path: string): {
    icon: JSX.Element;
    color: string;
    tooltip: string;
  } => {
    const result = pathResults.get(path);

    // If still loading or no result, use quick check
    if (!result) {
      const quick = quickCheckPath(path);
      if (loading) {
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          color: 'text-gray-400',
          tooltip: 'Checking path...'
        };
      }
      if (quick === 'likely') {
        return {
          icon: <Folder className="h-4 w-4" />,
          color: 'text-gray-400',
          tooltip: 'Path format looks valid'
        };
      }
      if (quick === 'unlikely') {
        return {
          icon: <FolderX className="h-4 w-4" />,
          color: 'text-yellow-600',
          tooltip: 'Path format may be invalid'
        };
      }
      return {
        icon: <Folder className="h-4 w-4" />,
        color: 'text-gray-400',
        tooltip: 'Unknown path format'
      };
    }

    // Check actual results
    if (result.exists) {
      if (!result.readable) {
        return {
          icon: <FolderLock className="h-4 w-4" />,
          color: 'text-orange-600',
          tooltip: `Path exists but not readable: ${result.expanded}`
        };
      }
      return {
        icon: <Folder className="h-4 w-4" />,
        color: 'text-green-600',
        tooltip: `Path exists: ${result.expanded}`
      };
    }

    return {
      icon: <FolderX className="h-4 w-4" />,
      color: 'text-red-600',
      tooltip: `Path does not exist: ${result.expanded}`
    };
  };

  return (
    <div className="space-y-2">
      {/* Existing paths */}
      {paths.map((path, index) => {
        const status = getPathStatus(path);
        const result = pathResults.get(path);
        const isFirst = index === 0;
        const isLast = index === paths.length - 1;

        return (
          <div
            key={index}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg group transition-colors cursor-pointer select-none"
            onClick={(e) => {
              e.stopPropagation();
              setContextMenu({
                isOpen: true,
                index,
                path,
                position: {
                  x: Math.min(e.clientX, window.innerWidth - 200),
                  y: Math.min(e.clientY, window.innerHeight - 300)
                }
              });
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1">
                <div className={`${status.color} flex-shrink-0`} title={status.tooltip}>
                  {status.icon}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm" title={path}>
                    {path}
                  </div>
                  {result && result.expanded !== path && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      → {result.expanded}
                    </div>
                  )}
                </div>
                {result && !result.exists && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Not found
                  </span>
                )}
              </div>
              <MoreVertical className="h-4 w-4 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        );
      })}

      {/* Edit Modal */}
      {editingPath && (
        <EditModal
          isOpen={true}
          title={editingPath.isNew ? 'Add Path' : 'Edit Path'}
          fields={{
            value: {
              label: 'Directory Path',
              value: editingPath.value,
              placeholder: '/path/to/directory',
            },
          }}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Add button */}
      {
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Path</span>
        </button>
      }

      {/* Empty state */}
      {paths.length === 0 && !editingPath && (
        <div className="text-center py-8 text-gray-500">
          <p>No paths configured</p>
          <p className="text-sm mt-1">Add directories to your PATH variable</p>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.isOpen && (
        <ContextMenu
          isOpen={contextMenu.isOpen}
          onClose={() => setContextMenu({ isOpen: false, index: -1, path: '' })}
          items={[
            {
              icon: <Edit2 className="h-4 w-4" />,
              label: 'Edit',
              action: () => handleEdit(contextMenu.index)
            },
            {
              icon: <Copy className="h-4 w-4" />,
              label: 'Copy Path',
              action: () => {
                navigator.clipboard.writeText(contextMenu.path);
                toast.success('Path copied to clipboard');
              }
            },
            ...(contextMenu.index > 0 ? [{
              icon: <ChevronUp className="h-4 w-4" />,
              label: 'Move Up',
              action: () => {
                moveUp(contextMenu.index);
                toast.success('Path moved up');
              }
            }] : []),
            ...(contextMenu.index < paths.length - 1 ? [{
              icon: <ChevronDown className="h-4 w-4" />,
              label: 'Move Down',
              action: () => {
                moveDown(contextMenu.index);
                toast.success('Path moved down');
              }
            }] : []),
            ...(contextMenu.index > 0 ? [{
              icon: <ChevronsUp className="h-4 w-4" />,
              label: 'Move to Top',
              action: () => {
                moveToTop(contextMenu.index);
                toast.success('Path moved to top');
              }
            }] : []),
            ...(contextMenu.index < paths.length - 1 ? [{
              icon: <ChevronsDown className="h-4 w-4" />,
              label: 'Move to Bottom',
              action: () => {
                moveToBottom(contextMenu.index);
                toast.success('Path moved to bottom');
              }
            }] : []),
            {
              icon: <Trash2 className="h-4 w-4" />,
              label: 'Delete',
              action: () => {
                handleDelete(contextMenu.index);
                toast.success('Path deleted');
              },
              variant: 'danger'
            }
          ].flat()}
          position={contextMenu.position}
        />
      )}

      {/* Loading indicator */}
      {loading && paths.length > 0 && (
        <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Checking paths...
        </div>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Tip:</strong> Click on a path to edit, reorder, or delete it. Paths are
          searched from top to bottom. Environment variables like <code>$HOME</code> and <code>~</code> are automatically expanded.
        </p>
      </div>
    </div>
  );
}
