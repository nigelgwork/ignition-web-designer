import ProjectTree from './components/ProjectTree'
import Canvas from './components/Canvas'
import PropertyEditor from './components/PropertyEditor'
import ComponentPalette from './components/ComponentPalette'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🎨 Web Designer</h1>
        <span className="version">v0.5.0 - Phase 5</span>
      </header>

      <div className="app-content">
        <aside className="sidebar left-sidebar">
          <ProjectTree />
          <ComponentPalette />
        </aside>

        <main className="main-content">
          <Canvas />
        </main>

        <aside className="sidebar right-sidebar">
          <PropertyEditor />
        </aside>
      </div>
    </div>
  )
}
