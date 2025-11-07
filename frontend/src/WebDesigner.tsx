import React from 'react'
import Canvas from './components/Canvas'
import PropertyEditor from './components/PropertyEditor'
import LeftSidebar from './components/LeftSidebar/LeftSidebar'
import MenuBar from './components/MenuBar'
import { useDesignerStore } from './store'
import './App.css'

// Main WebDesigner component exported for Gateway integration
// This is mounted via GatewayHook.setup() using NavigationModel
const WebDesigner: React.FC = () => {
  const { leftSidebarVisible, rightSidebarVisible } = useDesignerStore()

  const openFullScreen = () => {
    const baseUrl = window.location.origin
    // Navigate to standalone full-screen version (same window to preserve session)
    const standaloneUrl = `${baseUrl}/data/webdesigner/standalone`
    // Use window.location instead of window.open to preserve session cookies
    window.location.href = standaloneUrl
  }

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
    </div>
  )
}

export default WebDesigner
