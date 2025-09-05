'use client'

import { useRouter } from 'next/navigation'
import { SoftwareDefinition, SoftwareStatus } from '@/types/software'
import { 
  Terminal, 
  FileText, 
  GitBranch, 
  Package, 
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Edit
} from 'lucide-react'

interface SoftwareCardProps {
  software: SoftwareDefinition
  status: SoftwareStatus
}

const iconMap: Record<string, any> = {
  terminal: Terminal,
  'file-text': FileText,
  'git-branch': GitBranch,
  package: Package,
  settings: Settings,
  code: FileText,
  key: Settings,
  layers: Terminal,
}

const categoryColors: Record<string, string> = {
  shell: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  editor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  terminal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  vcs: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  package_manager: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  tools: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
}

export function SoftwareCard({ software, status }: SoftwareCardProps) {
  const router = useRouter()
  const Icon = iconMap[software.icon] || Settings
  const isComplete = software.isComplete !== false  // Default to true for backward compatibility

  const handleClick = () => {
    if (isComplete) {
      router.push(`/software/${software.id}`)
    }
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Never'
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleDateString()
  }

  return (
    <div
      onClick={handleClick}
      className={`border rounded-lg p-6 transition-all ${
        isComplete 
          ? 'hover:shadow-lg cursor-pointer' 
          : 'opacity-60 cursor-not-allowed'
      } bg-white dark:bg-gray-800 dark:border-gray-700`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <Icon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{software.displayName}</h3>
            <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[software.category]}`}>
              {software.category.replace('_', ' ')}
            </span>
          </div>
        </div>
        {isComplete ? (
          <button
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <Edit className="h-4 w-4" />
          </button>
        ) : (
          <div className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            Coming Soon
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {software.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Installed</span>
          <div className="flex items-center gap-1">
            {status.installed ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Yes</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">No</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Config exists</span>
          <div className="flex items-center gap-1">
            {status.configExists ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Yes</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">No</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last modified</span>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">
              {formatDate(status.lastModified)}
            </span>
          </div>
        </div>

        {status.version && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Version</span>
            <span className="text-gray-600 dark:text-gray-400 font-mono text-xs">
              {status.version}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t dark:border-gray-700">
        <button 
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            isComplete
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
          }`}
          disabled={!isComplete}
        >
          {isComplete ? 'Configure' : 'Not Available'}
        </button>
      </div>
    </div>
  )
}