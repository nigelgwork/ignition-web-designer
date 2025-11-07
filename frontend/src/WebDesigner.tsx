import React, { useState, useEffect } from 'react'
import Canvas from './components/Canvas'
import PropertyEditor from './components/PropertyEditor'
import LeftSidebar from './components/LeftSidebar/LeftSidebar'
import MenuBar from './components/MenuBar'
import ToastContainer from './components/Toast/ToastContainer'
import KeyboardShortcutsHelp from './components/KeyboardShortcutsHelp'
import { useDesignerStore } from './store'
import './App.css'

// Main WebDesigner component exported for Gateway integration
// This is mounted via GatewayHook.setup() using NavigationModel
const WebDesigner: React.FC = () => {
  const { leftSidebarVisible, rightSidebarVisible } = useDesignerStore()
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false)

  const openFullScreen = () => {
    const baseUrl = window.location.origin
    // Navigate to standalone full-screen version (same window to preserve session)
    const standaloneUrl = `${baseUrl}/data/webdesigner/standalone`
    // Use window.location instead of window.open to preserve session cookies
    window.location.href = standaloneUrl
  }

  // Global keyboard shortcut listener for '?'
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if '?' is pressed and not in an input field
      if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault()
        setShortcutsHelpOpen(true)
      }

      // ESC to close shortcuts dialog
      if (e.key === 'Escape' && shortcutsHelpOpen) {
        setShortcutsHelpOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shortcutsHelpOpen])

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 Web Designer</h1>
        <span className="version">v0.18.0 - Redesigned Sidebar</span>
        <button
          onClick={openFullScreen}
          className="open-new-window-btn"
          title="Switch to full-screen mode (no Gateway sidebar)"
        >
          ⛶ Full Screen
        </button>
      </header>

      <MenuBar />

      <div className="app-content">
        {leftSidebarVisible && <LeftSidebar />}

        <main className="main-content">
          <Canvas />
        </main>

        {rightSidebarVisible && (
          <aside className="sidebar right-sidebar">
            <PropertyEditor />
          </aside>
        )}
      </div>

      {/* Toast notifications */}
      <ToastContainer />

      {/* Keyboard shortcuts help dialog */}
      <KeyboardShortcutsHelp isOpen={shortcutsHelpOpen} onClose={() => setShortcutsHelpOpen(false)} />
    </div>
  )
}

export default WebDesigner
