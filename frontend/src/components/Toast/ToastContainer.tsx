/**
 * Toast Container Component
 *
 * Renders all active toast notifications in a fixed position.
 */

import React from 'react'
import { useToastStore } from '../../store/toastStore'
import ToastNotification from './ToastNotification'
import './Toast.css'

const ToastContainer: React.FC = () => {
  const { toasts } = useToastStore()

  if (toasts.length === 0) {
    return null
  }

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

export default ToastContainer
