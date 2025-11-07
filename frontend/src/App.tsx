import Canvas from './components/Canvas'
import PropertyEditor from './components/PropertyEditor'
import LeftSidebar from './components/LeftSidebar/LeftSidebar'
import MenuBar from './components/MenuBar'
import { useDesignerStore } from './store'
import './App.css'

// Legacy standalone app component - kept for local development with Vite
// For production Gateway integration, use WebDesigner.tsx via index.ts
export default function App() {
  const { leftSidebarVisible, rightSidebarVisible } = useDesignerStore()

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 Web Designer</h1>
        <span className="version">v0.18.0 - Redesigned Sidebar</span>
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
