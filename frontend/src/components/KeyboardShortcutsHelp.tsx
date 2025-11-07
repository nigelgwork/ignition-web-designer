/**
 * Keyboard Shortcuts Help Dialog
 *
 * Displays all available keyboard shortcuts in a modal dialog.
 * Triggered by pressing '?' or from the Help menu.
 */

import React from 'react'
import './KeyboardShortcutsHelp.css'

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutCategory {
  category: string
  shortcuts: {
    keys: string
    description: string
  }[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    category: 'General',
    shortcuts: [
      { keys: '?', description: 'Show this help dialog' },
      { keys: 'Ctrl+S', description: 'Save current view' },
      { keys: 'Esc', description: 'Clear selection / Close dialogs' },
    ],
  },
  {
    category: 'Editing',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo last action' },
      { keys: 'Ctrl+Y', description: 'Redo last action' },
      { keys: 'Ctrl+Shift+Z', description: 'Redo last action (alternate)' },
      { keys: 'Delete', description: 'Delete selected component(s)' },
      { keys: 'Backspace', description: 'Delete selected component(s) (Mac)' },
    ],
  },
  {
    category: 'Clipboard',
    shortcuts: [
      { keys: 'Ctrl+C', description: 'Copy selected component(s)' },
      { keys: 'Ctrl+X', description: 'Cut selected component(s)' },
      { keys: 'Ctrl+V', description: 'Paste component(s)' },
      { keys: 'Ctrl+D', description: 'Duplicate selected component(s)' },
    ],
  },
  {
    category: 'Selection',
    shortcuts: [
      { keys: 'Click', description: 'Select component' },
      { keys: 'Ctrl+Click', description: 'Add/remove from selection' },
      { keys: 'Shift+Click', description: 'Select range (future)' },
      { keys: 'Ctrl+A', description: 'Select all (future)' },
    ],
  },
  {
    category: 'View',
    shortcuts: [
      { keys: 'Ctrl+Plus', description: 'Zoom in' },
      { keys: 'Ctrl+Minus', description: 'Zoom out' },
      { keys: 'Ctrl+0', description: 'Reset zoom to 100%' },
      { keys: 'Ctrl+G', description: 'Toggle grid overlay' },
    ],
  },
  {
    category: 'Navigation',
    shortcuts: [
      { keys: 'Ctrl+B', description: 'Toggle left sidebar (Project tree)' },
      { keys: 'Ctrl+P', description: 'Toggle right sidebar (Properties)' },
    ],
  },
  {
    category: 'Alignment',
    shortcuts: [
      { keys: 'Alt+Left', description: 'Align left' },
      { keys: 'Alt+Right', description: 'Align right' },
      { keys: 'Alt+Up', description: 'Align top' },
      { keys: 'Alt+Down', description: 'Align bottom' },
    ],
  },
]

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="close-btn" onClick={onClose} title="Close (Esc)">
            ✕
          </button>
        </div>

        <div className="shortcuts-content">
          {shortcutCategories.map((category) => (
            <div key={category.category} className="shortcut-category">
              <h3>{category.category}</h3>
              <table className="shortcuts-table">
                <tbody>
                  {category.shortcuts.map((shortcut, index) => (
                    <tr key={index}>
                      <td className="shortcut-keys">
                        <kbd>{shortcut.keys}</kbd>
                      </td>
                      <td className="shortcut-description">{shortcut.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="shortcuts-footer">
          <p className="shortcuts-note">
            💡 Tip: Press <kbd>?</kbd> anytime to see this dialog
          </p>
          <button className="btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsHelp
