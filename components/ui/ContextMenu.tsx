'use client'

import { useEffect, useRef } from 'react'

interface ContextMenuItem {
  icon: React.ReactNode
  label: string
  action: () => void
  variant?: 'default' | 'danger'
}

interface ContextMenuProps {
  isOpen: boolean
  onClose: () => void
  items: ContextMenuItem[]
  position?: { x: number; y: number }
}

export function ContextMenu({ isOpen, onClose, items, position }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 min-w-[160px] animate-scale-in"
        style={{
          top: position ? `${position.y}px` : '50%',
          left: position ? `${position.x}px` : '50%',
          transform: position ? 'none' : 'translate(-50%, -50%)',
        }}
      >
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.action()
              onClose()
            }}
            className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm transition-colors ${
              item.variant === 'danger'
                ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </>
  )
}