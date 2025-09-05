import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString()
    const newToast = { ...toast, id }
    
    set((state) => ({
      toasts: [...state.toasts, newToast]
    }))
    
    // Auto remove after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id)
        }))
      }, toast.duration || 3000)
    }
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  },
  clearToasts: () => {
    set({ toasts: [] })
  }
}))

// Helper functions for common toast types
export const toast = {
  success: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: 'success',
      title,
      message,
      duration: 3000
    })
  },
  error: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      duration: 5000
    })
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: 'info',
      title,
      message,
      duration: 3000
    })
  },
  warning: (title: string, message?: string) => {
    useToastStore.getState().addToast({
      type: 'warning',
      title,
      message,
      duration: 4000
    })
  }
}