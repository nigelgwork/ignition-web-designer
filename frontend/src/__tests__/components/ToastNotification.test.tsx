import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ToastNotification from '../../components/Toast/ToastNotification'
import { Toast, ToastType } from '../../types'

/**
 * Unit tests for ToastNotification component.
 *
 * Tests toast rendering, dismissal, action buttons, and auto-dismiss behavior.
 */
describe('ToastNotification', () => {
  // Mock dismiss function
  const mockDismiss = jest.fn()

  beforeEach(() => {
    mockDismiss.mockClear()
  })

  // ===== Rendering Tests =====

  test('renders success toast with title and message', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-1',
      type: ToastType.SUCCESS,
      title: 'Success',
      message: 'Operation completed successfully',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByText('Success')).toBeInTheDocument()
    expect(screen.getByText('Operation completed successfully')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveClass('toast', 'toast-success')
  })

  test('renders error toast with correct styling', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-2',
      type: ToastType.ERROR,
      title: 'Error',
      message: 'Something went wrong',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveClass('toast', 'toast-error')
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  test('renders warning toast with correct styling', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-3',
      type: ToastType.WARNING,
      message: 'Warning message',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveClass('toast', 'toast-warning')
  })

  test('renders info toast with correct styling', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-4',
      type: ToastType.INFO,
      message: 'Info message',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByRole('alert')).toHaveClass('toast', 'toast-info')
  })

  test('renders toast without title', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-5',
      type: ToastType.INFO,
      message: 'Just a message',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByText('Just a message')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  // ===== Dismissal Tests =====

  test('calls onDismiss when close button clicked', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-6',
      type: ToastType.INFO,
      message: 'Test message',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)
    const closeButton = screen.getByTitle('Dismiss')
    fireEvent.click(closeButton)

    // Assert
    expect(mockDismiss).toHaveBeenCalledTimes(1)
    expect(mockDismiss).toHaveBeenCalledWith('test-6')
  })

  test('calls onDismiss with correct ID when dismissed', () => {
    // Arrange
    const toast: Toast = {
      id: 'unique-id-123',
      type: ToastType.SUCCESS,
      message: 'Test',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)
    fireEvent.click(screen.getByTitle('Dismiss'))

    // Assert
    expect(mockDismiss).toHaveBeenCalledWith('unique-id-123')
  })

  // ===== Action Button Tests =====

  test('renders action button when provided', () => {
    // Arrange
    const mockAction = jest.fn()
    const toast: Toast = {
      id: 'test-7',
      type: ToastType.WARNING,
      message: 'Unsaved changes',
      duration: 5000,
      action: {
        label: 'Save Now',
        onClick: mockAction,
      },
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    const actionButton = screen.getByText('Save Now')
    expect(actionButton).toBeInTheDocument()
    expect(actionButton).toHaveClass('toast-action-button')
  })

  test('calls action callback when action button clicked', () => {
    // Arrange
    const mockAction = jest.fn()
    const toast: Toast = {
      id: 'test-8',
      type: ToastType.INFO,
      message: 'Action required',
      duration: 5000,
      action: {
        label: 'Click Me',
        onClick: mockAction,
      },
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)
    fireEvent.click(screen.getByText('Click Me'))

    // Assert
    expect(mockAction).toHaveBeenCalledTimes(1)
  })

  test('dismisses toast after action button clicked', () => {
    // Arrange
    const mockAction = jest.fn()
    const toast: Toast = {
      id: 'test-9',
      type: ToastType.INFO,
      message: 'Action required',
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: mockAction,
      },
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)
    fireEvent.click(screen.getByText('Undo'))

    // Assert
    expect(mockDismiss).toHaveBeenCalledWith('test-9')
  })

  test('does not render action button when not provided', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-10',
      type: ToastType.SUCCESS,
      message: 'No action needed',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.queryByRole('button', { name: /action/i })).not.toBeInTheDocument()
  })

  // ===== Auto-Dismiss Tests =====

  test('auto-dismisses after duration', async () => {
    // Arrange
    jest.useFakeTimers()
    const toast: Toast = {
      id: 'test-11',
      type: ToastType.INFO,
      message: 'Auto dismiss',
      duration: 3000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Fast-forward time
    jest.advanceTimersByTime(3000)

    // Assert
    await waitFor(() => {
      expect(mockDismiss).toHaveBeenCalledWith('test-11')
    })

    jest.useRealTimers()
  })

  test('does not auto-dismiss when duration is 0', async () => {
    // Arrange
    jest.useFakeTimers()
    const toast: Toast = {
      id: 'test-12',
      type: ToastType.WARNING,
      message: 'Manual dismiss only',
      duration: 0, // No auto-dismiss
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Fast-forward time
    jest.advanceTimersByTime(10000)

    // Assert - Should NOT have been dismissed
    expect(mockDismiss).not.toHaveBeenCalled()

    jest.useRealTimers()
  })

  // ===== Accessibility Tests =====

  test('has proper ARIA role', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-13',
      type: ToastType.INFO,
      message: 'Accessible toast',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  test('close button has accessible label', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-14',
      type: ToastType.SUCCESS,
      message: 'Accessible close',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    const closeButton = screen.getByTitle('Dismiss')
    expect(closeButton).toHaveAttribute('aria-label', 'Close notification')
  })

  // ===== Edge Cases =====

  test('handles very long messages', () => {
    // Arrange
    const longMessage = 'This is a very long message that should be handled properly by the toast component without breaking the layout or causing any visual issues. '.repeat(5)
    const toast: Toast = {
      id: 'test-15',
      type: ToastType.INFO,
      message: longMessage,
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert
    expect(screen.getByText(longMessage)).toBeInTheDocument()
  })

  test('handles special characters in message', () => {
    // Arrange
    const toast: Toast = {
      id: 'test-16',
      type: ToastType.ERROR,
      message: '<script>alert("XSS")</script> & special chars: < > " \'',
      duration: 5000,
    }

    // Act
    render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)

    // Assert - Should render as text, not execute script
    expect(screen.getByText(/script.*alert.*XSS/)).toBeInTheDocument()
  })

  test('handles undefined optional fields', () => {
    // Arrange - Minimal toast with only required fields
    const toast: Toast = {
      id: 'test-17',
      type: ToastType.INFO,
      message: 'Minimal toast',
      duration: 5000,
      // No title, no action
    }

    // Act & Assert - Should not throw
    expect(() => {
      render(<ToastNotification toast={toast} onDismiss={mockDismiss} />)
    }).not.toThrow()
  })
})
