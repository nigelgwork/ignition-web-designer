/**
 * Toast Notification Store
 *
 * Manages toast notifications for user feedback throughout the application.
 *
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss
 * - Stack management (multiple toasts)
 * - Action buttons (optional)
 */

import { create } from 'zustand'

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Toast {
  id: string
  type: ToastType
  title?: string
  message: string
  duration?: number // milliseconds, 0 = no auto-dismiss
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastState {
  toasts: Toast[]

  // Actions
  showToast: (toast: Omit<Toast, 'id'>) => string
  showSuccess: (message: string, title?: string, duration?: number) => string
  showError: (message: string, title?: string, duration?: number) => string
  showWarning: (message: string, title?: string, duration?: number) => string
  showInfo: (message: string, title?: string, duration?: number) => string
  dismissToast: (id: string) => void
  dismissAll: () => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration !== undefined ? toast.duration : 5000, // Default 5s
    }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-dismiss if duration > 0
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().dismissToast(id)
      }, newToast.duration)
    }

    return id
  },

  showSuccess: (message, title, duration) => {
    return get().showToast({
      type: ToastType.SUCCESS,
      title: title || 'Success',
      message,
      duration,
    })
  },

  showError: (message, title, duration) => {
    return get().showToast({
      type: ToastType.ERROR,
      title: title || 'Error',
      message,
      duration: duration !== undefined ? duration : 8000, // Errors stay longer
    })
  },

  showWarning: (message, title, duration) => {
    return get().showToast({
      type: ToastType.WARNING,
      title: title || 'Warning',
      message,
      duration,
    })
  },

  showInfo: (message, title, duration) => {
    return get().showToast({
      type: ToastType.INFO,
      title: title || 'Info',
      message,
      duration,
    })
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },

  dismissAll: () => {
    set({ toasts: [] })
  },
}))
