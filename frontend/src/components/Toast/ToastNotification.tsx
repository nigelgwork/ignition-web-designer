/**
 * Individual Toast Notification Component
 */

import React from 'react'
import { Toast, ToastType, useToastStore } from '../../store/toastStore'
import './Toast.css'

interface ToastNotificationProps {
  toast: Toast
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast }) => {
  const { dismissToast } = useToastStore()

  const getIcon = () => {
    switch (toast.type) {
      case ToastType.SUCCESS:
        return '✓'
      case ToastType.ERROR:
        return '✕'
      case ToastType.WARNING:
        return '⚠'
      case ToastType.INFO:
        return 'ℹ'
      default:
        return ''
    }
  }

  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon">{getIcon()}</div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
        {toast.action && (
          <button className="toast-action" onClick={toast.action.onClick}>
            {toast.action.label}
          </button>
        )}
      </div>
      <button className="toast-close" onClick={() => dismissToast(toast.id)} title="Dismiss">
        ✕
      </button>
    </div>
  )
}

export default ToastNotification
